import { UserType } from '@models/userType.enum';

export interface IAuthPayload {
  _id?: string;
  email?: string;
  exp?: number;
  iat?: number;
  userType?: UserType;
}
