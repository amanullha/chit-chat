import { Status } from "@models/status.enum";
import { UserType } from "@models/userType.enum";
import {  Document, Types } from 'mongoose';


export interface IUserKey {
  _id?:Types.ObjectId | string;
}
// export interface IUser extends IUserKey {
export interface IUser {
  readonly _id?:Types.ObjectId | string;
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly password?: string;
  readonly salt?: string;
  readonly userType?:UserType;
  readonly verificationCode?: string;
  readonly resetCode?: string;
  readonly isVerified?: boolean;
  readonly status?: Status;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly __v?:number;
}


export class JwtTokens{
  accessToken?:string;
  refreshToken?:string;
}