import { INDEX_NAME } from '@models/elasticIndexName.enum';
import { HttpStatus } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { GlobalHelper } from './global.helper';
import { ExceptionHelper } from './exception.helper';
import * as dotenv from 'dotenv';
dotenv.config();

export interface IElasticResponse {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: any;
    hits: Array<any>;
  };
}

export interface ISearchFilter {
  query: {
    bool: {
      must: any[];
      filter: any[];
    };
  };
  size: number;
  from: number;
}

export interface IElSearchSessionOverTime {
  query: {
    bool: {
      must: any[];
      filter: any[];
    };
  };
  size: number;
  aggs: {
    session_over_time_every_day: {
      date_range: {
        field: string;
        ranges: any[];
      };
      aggs: any;
    };
  };
}

const dummyResponse = {
  took: 0,
  timed_out: false,
  _shards: {
    total: 0,
    successful: 0,
    skipped: 0,
    failed: 0,
  },
  hits: {
    total: {
      value: 0,
      relation: 'eq',
    },
    max_score: 0,
    hits: [],
  },
};
const host = process.env.OPENSEARCH_DOMAIN;
const protocol = 'https';
const url = protocol + '://' + host;

const client = new Client({
  node: url,
  auth: {
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

const fixDateTypeData = (obj: any): any => {
  const regex =
    /[1-2]\d{3}-(0[1-9]|1[0-2])-(3[0-1]|[1-2]\d|0[1-9])T(0\d|1[0-2])(:[0-5]\d){2}.\d{3}Z/;

  const regex2 = /\d{13}/;

  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    if (regex.test(obj[keys[i]]) || regex2.test(obj[keys[i]])) {
      // if (!obj[keys[i]].toString().includes('.'))
      if (
        !keys[i].includes('longitude') &&
        !keys[i].includes('latitude') &&
        !keys[i].includes('totals') &&
        !keys[i].includes('doubleTotals') &&
        !keys[i].includes('doubleinvFee') &&
        !keys[i].includes('invFee') &&
        !keys[i].includes('zohoCompanyId') &&
        !keys[i].includes('chargingRate') &&
        !keys[i].includes('email')
      ) {
        const date = new Date(obj[keys[i]]);
        obj[keys[i]] = date;
      }
    }
  }

  return obj;
};

const getParsedResponseData = (response: IElasticResponse): any => {
  if (response.hits.hits.length == 0) {
    return null;
  } else {
    return response.hits.hits[0]?._source;
  }
};

export class ElasticSearchHelper {
  static async index(indexName: INDEX_NAME, object: any): Promise<any> {
    object = fixDateTypeData(object);
    const config = {
      id: object['id'],
      index: `${process.env.SERVER_TYPE}${indexName}`,
      body: object,
      refresh: true,
    };
    const response = await client.index(config);
    return response;
  }

  static async search(indexName: INDEX_NAME, query: any): Promise<any> {
    try {
      const response = await client.search({
        index: `${process.env.SERVER_TYPE}${indexName}`,
        body: query,
        // filter_path: ['hits.hits._source']
      });

      return response;
    } catch (e) {
      console.log(e);
      return {
        body: dummyResponse,
      };
    }
  }

  // static async deleteOneById(
  //     indexName: INDEX_NAME,
  //     id: string,
  //     ){
  //     const response = await client.deleteByQuery({
  //         index: `${process.env.SERVER_TYPE}${indexName}`,
  //         type: `_doc`
  //         body: {
  //             query: {
  //                 query_string: {
  //                     query: `\"${id}\"`,
  //                     fields: ['id'],
  //                 },
  //             },
  //         },
  //     })
  // }

  static async findOne(
    indexName: INDEX_NAME,
    id: string,
    onlyIndexedObject = true,
  ): Promise<any> {
    const response = await client.search({
      index: `${process.env.SERVER_TYPE}${indexName}`,
      body: {
        query: {
          query_string: {
            query: `\"${id}\"`,
            fields: ['id'],
          },
        },
      },
    });

    if (onlyIndexedObject) {
      // @ts-ignore
      const data = getParsedResponseData(response.body);
      if (!GlobalHelper.getInstance().isEmpty(data) && data?.id != id) {
        ExceptionHelper.getInstance().defaultError(
          'Invalid Id',
          'invalid_id',
          HttpStatus.NOT_FOUND,
        );
      }

      return data;
    } else {
      return response;
    }
  }
  static async findOneByZip(
    indexName: INDEX_NAME,
    zip: string,
    onlyIndexedObject = true,
  ): Promise<any> {
    const response = await client.search({
      index: `${process.env.SERVER_TYPE}${indexName}`,
      body: {
        query: {
          query_string: {
            query: `\"${zip}\"`,
            fields: ['zip'],
          },
        },
      },
    });

    if (onlyIndexedObject) {
      // @ts-ignore
      return getParsedResponseData(response.body);
    } else {
      return response;
    }
  }
  static async findOneByEmail(
    indexName: INDEX_NAME,
    email: string,
    onlyIndexedObject = true,
  ): Promise<any> {
    const response = await client.search({
      index: `${process.env.SERVER_TYPE}${indexName}`,
      body: {
        query: {
          query_string: {
            query: `\"${email}\"`,
            fields: ['email'],
          },
        },
      },
    });

    if (onlyIndexedObject) {
      // @ts-ignore
      return getParsedResponseData(response.body);
    } else {
      return response;
    }
  }
  static async findOneRoleByRoleType(
    indexName: INDEX_NAME,
    type: string,
    onlyIndexedObject = true,
  ): Promise<any> {
    const response = await client.search({
      index: `${process.env.SERVER_TYPE}${indexName}`,
      body: {
        query: {
          query_string: {
            query: `\"${type}\"`,
            fields: ['type'],
          },
        },
      },
    });

    if (onlyIndexedObject) {
      // @ts-ignore
      return getParsedResponseData(response.body);
    } else {
      return response;
    }
  }
  static async findOneUserByEmail(
    indexName: INDEX_NAME,
    email: string,
    onlyIndexedObject = true,
  ): Promise<any> {
    const response = await client.search({
      index: `${process.env.SERVER_TYPE}${indexName}`,
      body: {
        query: {
          query_string: {
            query: `\"${email}\"`,
            fields: ['email'],
          },
        },
      },
    });

    if (onlyIndexedObject) {
      // @ts-ignore
      return getParsedResponseData(response.body);
    } else {
      return response;
    }
  }

  static getFixedQueryString(search: string): string {
    let queryStr = '';
    const escaperules = [
      '+',
      // '-',
      '&',
      '|',
      '!',
      '(',
      ')',
      '{',
      '}',
      '[',
      ']',
      '^',
      '~',
      '*',
      '?',
      ':',
      '"',
      // '@',
      '#',
      '$',
    ];
    if (!GlobalHelper.getInstance().isEmpty(search)) {
      for (let i = 0; i < escaperules.length; i++) {
        queryStr = search.replaceAll(escaperules[i], `\\${escaperules[i]}`);
      }
      if (
        (search.includes(' ') || search.includes('-')) &&
        !search.startsWith(' ')
      ) {
        queryStr = `\"${search.split(' ').join('*').split('-').join('*')}*\"`;
      } else if (queryStr.includes('@')) {
        queryStr = `${search}`;
      } else if (
        queryStr.includes('*') ||
        queryStr.includes('~') ||
        queryStr.includes('^') ||
        queryStr.includes('(') ||
        queryStr.includes(')') ||
        queryStr.includes('!') ||
        queryStr.includes('?')
      ) {
        queryStr = `\"${search}*\"`;
      } else {
        if (search.startsWith('+')) {
          queryStr = `${search.trim()}*`;
        } else {
          queryStr = `*${search.trim()}*`;
        }
      }
    }

    return queryStr.trim();
  }
  //commit

  static checker = (arr): any => arr.some((v) => v === true);

  static hasMultiplePluses(str: string) {
    const regex = /\+.*\+/;
    const test = regex.test(str);
    return test;
  }

  static getFilteredResults(search, data, keys: Array<string>): any {
    if (search && keys.length > 0 && data.length > 0) {
      let finalData = [];
      for (let i = 0; i < data.length; i++) {
        let added = false;
        for (let j = 0; j < keys.length; j++) {
          const value = data[i]._source[keys[j]];
          if (value != null) {
            const dataValues: Array<string> = value
              .toString()
              .toLowerCase()
              .split(' ');
            let searchMatchValue: string = search.toLowerCase();
            // if (searchMatchValue.startsWith(' ')){
            //     let splitSearch = searchMatchValue.split(' ')
            //     searchMatchValue = '+' + splitSearch[1]
            // }
            for (let k = 0; k < dataValues.length; k++) {
              const joinedStr = dataValues.slice(k).join(' ');
              if (keys[j] == 'phone') {
                if (!searchMatchValue.startsWith('+')) {
                  if (
                    joinedStr.startsWith(`+${searchMatchValue.trim()}`) ||
                    joinedStr.startsWith(`${searchMatchValue.trim()}`)
                  ) {
                    finalData.push(data[i]);
                    added = true;
                    break;
                  }
                } else {
                  let splitSearch = searchMatchValue.split('+');

                  if (
                    joinedStr.startsWith(`+${splitSearch[1].trim()}`) ||
                    joinedStr.startsWith(`${splitSearch[1].trim()}`)
                  ) {
                    finalData.push(data[i]);
                    added = true;
                    break;
                  }
                }
              } else if (joinedStr.includes(searchMatchValue)) {
                finalData.push(data[i]);
                added = true;
                break;
              }
              // else if (joinedStr.endsWith(searchMatchValue)) {
              //     finalData.push(data[i]);
              //     added = true;
              //     break;
              // }
            }
          }

          if (added) {
            break;
          }
        }
      }

      return finalData;
    }

    return data;
  }
}
