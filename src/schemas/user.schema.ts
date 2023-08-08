import { Provider } from '@models/privider.enum';
import { Status } from '@models/status.enum';
import { UserType } from '@models/userType.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop({ unique: true })
  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  password: string;

  @Prop()
  salt: string;

  @Prop()
  verificationCode: string;

  @Prop()
  resetCode: string;

  @Prop()
  isVerified: boolean;

  @Prop({
    // type: Status,
    enum: [Status.ACTIVE, Status.IN_ACTIVE],
    default: Status.ACTIVE
  })
  status: Status;

  @Prop({
    // type: UserType,
    enum: [UserType.ADMIN, UserType.CUSTOMER, UserType.GUEST, UserType.SUPPER_ADMIN],
    default: UserType.CUSTOMER
  })
  userType: UserType;

  @Prop({
    enum: [Provider.CUSTOM, Provider.GOOGLE],
    default: Provider.GOOGLE
  })
  provider: Provider;
}
export const UserSchema = SchemaFactory.createForClass(User);


// import * as mongoose from 'mongoose';

// export const UserSchema = new mongoose.Schema({
//         name: {
//           type: String,
//         },
//         email: {
//           type: String,
//           unique:true,
//         },
//         phone: {
//           type: String,
//         },
//         password: {
//           type: String,
//         },
//         salt: {
//           type: String,
//         },
//         verificationCode: {
//           type: String,
//         },
//         resetCode: {
//           type: String,
//         },
//         isVerified: {
//           type: Boolean,
//         },
//         status: {
//           type: String,
//           enum: [Status.ACTIVE, Status.IN_ACTIVE],
//           default: Status.ACTIVE,
//         },
//         userType: {
//           type: String,
//           enum: [UserType.ADMIN,UserType.CUSTOMER,UserType.GUEST,UserType.SUPPER_ADMIN],
//           default: UserType.CUSTOMER,
//         },
//       },
//       {
//         timestamps: true,
//       },
// );