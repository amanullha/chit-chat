import { Status } from "@models/status.enum";
import { UserType } from "@models/userType.enum";
import { IsEnum, IsOptional, Matches } from "class-validator";
const bangladeshiPhoneNumberRegex = /^(\+?880|0)(13|14|15|16|17|18|19)\d{8}$/;

export class UpdateProfileDto{
    // @IsOptional()
    // userId:string;

    @IsOptional()
    name:string;

    @IsOptional()
    @Matches(bangladeshiPhoneNumberRegex, {
        message: 'Invalid Bangladeshi phone number',
      })
    phone:string;

    // @IsOptional()
    // @IsEnum(UserType,{message:"Invalid_userTye"})
    // userType:string;

    // @IsOptional()
    // @IsEnum(Status,{message:"Invalid_status"})
    // status:string;
}