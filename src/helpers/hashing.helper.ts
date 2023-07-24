import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();
export class HashingHelper {
  private static instance: HashingHelper;
  static getInstance() {
    HashingHelper.instance = HashingHelper.instance ?? new HashingHelper();
    return HashingHelper.instance;
  }

  encryptObjectValues(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
      return bcrypt.hashSync(obj.toString(), 10);
    }
    // for array or obj
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // for value
        obj[key] = this.encryptObjectValues(obj[key]);
      } else {
        obj[key] = bcrypt.hashSync(obj[key].toString(), 10);
      }
    }
    return obj;
  }

  decryptObjectValues(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    // for array or obj
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // for value
        obj[key] = this.decryptObjectValues(obj[key]);
      } else {
        obj[key] = bcrypt.compareSync(obj[key].toString(), obj[key]);
      }
    }
    return obj;
  }
}
