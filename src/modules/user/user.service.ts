import { ExceptionHelper } from '@helpers/exception.helper';
import { GlobalHelper } from '@helpers/global.helper';
import { GoogleUserProfile, IUser, JwtTokens } from '@interfaces/user.interface';
import { DB_tables } from '@models/dbTable.enum';
import { Status } from '@models/status.enum';
import { UserType } from '@models/userType.enum';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUserDto';

import { AuthHelper } from '@helpers/auth.helper';
import { MailTemplate } from '@helpers/mailTemplateHelper';
import { EmailOptions } from '@interfaces/emailOptions.interface';
import { Provider } from '@models/privider.enum';
import { MailService } from '@modules/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '@schemas/user.schema';
import * as dotenv from 'dotenv';
import mongoose, { Model } from 'mongoose';
import { AllUserDto } from './dto/allUserDto';
import { UpdateProfileDto } from './dto/updateProfile';
import { LoginRequestType, UserLoginDto } from './dto/userLoginDto';
dotenv.config();
@Injectable()
export class UserService {

  constructor(
    @InjectModel(DB_tables.USER) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }

  async createUser(
    createUserDto: CreateUserDto,
    userType?: UserType,
  ): Promise<{ user: IUser; tokens: JwtTokens }> {

    await this.isExistUser(createUserDto);

    const obj = await this.constructCreateUserObj(createUserDto, userType);
    let user: IUser = (await this.userModel.create(obj)).toObject();
    await this.sendVerificationCode(user);
    const returnUser = this.constructReturnUserObj(user);
    return returnUser;

  }


  async isExistUser(createUserDto: CreateUserDto) {
    let existUser = await this.getUserByEmail(createUserDto?.email);
    if (!GlobalHelper.getInstance().isEmpty(existUser)) {
      if (existUser.provider == Provider.GOOGLE) {
        ExceptionHelper.getInstance().defaultError(
          "Email linked to existing Google user",
          "Email_linked_to_existing_Google_user",
          HttpStatus.CONFLICT
        );
      }

      else {
        ExceptionHelper.getInstance().defaultError(
          "User exist with this email",
          "User_exist_with_this_email",
          HttpStatus.CONFLICT
        );
      }

    }
  }

  async sendVerificationCode(user: IUser) {
    const token = await AuthHelper.getInstance().generateToken({ userId: user._id }, this.jwtService, '2D');
    // const token = '12345'
    const link = `localhost:${process.env.APP_PORT}/user/verify/${token}`
    let mailObj = {
      userName: user.name,
      to: user?.email,
      subject: "Verification Link",
      verificationLink: link
    }
    await this.sendEmail(mailObj);
  }
  async verifyUser(token: string) {
    const user = await AuthHelper.getInstance().getUserFromVerificationToken(token, this.userModel, this.jwtService);
    if (!GlobalHelper.getInstance().isEmpty(user)) {
      await this.userModel.findByIdAndUpdate(user?._id, { isVerified: true })
      return { isVerified: true }
    }
    else {
      ExceptionHelper.getInstance().defaultError("Invalid code", "Invalid_code", HttpStatus.BAD_REQUEST);
    }

  }
  // private resolveError(error: any) {
  //   if (error?.code == '11000') {
  //     ExceptionHelper.getInstance().throwDuplicateException(
  //       'User_exist_with_this_email',
  //     );
  //   }

  //   ExceptionHelper.getInstance().defaultError(
  //     error?.message,
  //     error?.message,
  //     error?.code,
  //   );
  // }


  async getUserByEmail(email: string): Promise<IUser> {

    if (!GlobalHelper.getInstance().isEmpty(email)) {
      const user = (
        await this.userModel.findOne({ email: email }).exec()
      )?.toObject();
      return user || null;
    }
    return null;

  }

  private async constructCreateUserObj(
    createUserDto: CreateUserDto,
    userType?: UserType,
    provider?: Provider
  ): Promise<IUser> {
    const hashPassword = await AuthHelper.getInstance().generateHash(
      createUserDto.password,
    );
    const obj = {
      name: createUserDto.name ?? '',
      email: createUserDto.email ?? '',
      phone: createUserDto.phone ?? '',
      password: hashPassword ?? '',
      userType: userType ?? UserType.CUSTOMER,
      salt: '',
      verificationCode: '',
      resetCode: '',
      // isVerified: userType ? true : false,
      isVerified: true,
      status: Status.ACTIVE,
      provider: provider ?? Provider.CUSTOM,
    };

    return obj;
  }

  async constructReturnUserObj(
    createdUser: IUser,
  ): Promise<{ user: IUser; tokens: JwtTokens }> {
    const userObj = {
      _id: createdUser?._id,
      name: createdUser?.name,
      email: createdUser?.email,
      status: createdUser?.status,
    };
    const generatedTokens = await AuthHelper.getInstance().generateTokens(
      createdUser,
      this.jwtService,
    );
    const tokens: JwtTokens = {
      accessToken: generatedTokens.accessToken,
      refreshToken: generatedTokens.refreshToken,
    };

    return { user: userObj, tokens: generatedTokens };
  }

  async getOneUser(userId: string): Promise<IUser> {
    if (!GlobalHelper.getInstance().isEmpty(userId)) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        return await this.userModel.findById(userId);
      } else {
        ExceptionHelper.getInstance().defaultError("Invalid user ID", "Invalid_user_ID", HttpStatus.BAD_REQUEST);
      }
    } else {
      ExceptionHelper.getInstance().defaultError("User not found", "User_not_found", HttpStatus.NOT_FOUND);
    }
  }

  async userLogin(
    userLoginDto: UserLoginDto,
  ): Promise<{ user: IUser; tokens: JwtTokens }> {
    const user: IUser = await AuthHelper.getInstance().verify(
      userLoginDto,
      this.userModel,
      this.jwtService,
    );
    if (GlobalHelper.getInstance().isEmpty(user)) {
      ExceptionHelper.getInstance().defaultError(
        'Invalid user',
        'Invalid_User',
        HttpStatus.BAD_GATEWAY,
      );
    }
    if (
      userLoginDto.type == LoginRequestType.Email &&
      !AuthHelper.getInstance().compareHash(
        userLoginDto.password,
        user?.password,
      )
    ) {
      ExceptionHelper.getInstance().defaultError(
        'Invalid password',
        'Invalid_password',
        HttpStatus.BAD_GATEWAY,
      );
    }
    return await this.constructReturnUserObj(user);
  }

  async getAllUsers(allUserDto: AllUserDto): Promise<IUser[]> {
    let { skip, limit } = GlobalHelper.getInstance().getPaginationInfo(
      allUserDto.currentPage,
      allUserDto.pageSize,
    );
    const users: IUser[] = await this.userModel
      .aggregate([{ $skip: skip }, { $limit: limit }])
      .exec();
    return users;
  }

  async updateProfile(
    user: IUser,
    updateProfileDto: UpdateProfileDto,
  ): Promise<IUser> {
    let obj = {
      phone: updateProfileDto.phone ?? user?.phone,
      name: updateProfileDto.name ?? user?.name,
    };
    if (!GlobalHelper.getInstance().isEmpty(user)) {
      let updateUser = await this.userModel
        .findByIdAndUpdate(user?._id, obj, { new: true })
        .lean()
        .exec();
      return updateUser;
    }
    else {
      ExceptionHelper.getInstance().defaultError("user not fund", "User_not_found", HttpStatus.NOT_FOUND);
    }
  }

  async sendEmail(data: EmailOptions) {
    const { to, subject, text, from } = data;
    let emailObj: EmailOptions = {
      to: to,
      subject: subject,
      text: text,
      html: MailTemplate.getInstance().createVerificationHtmlTemplate(data.userName, data.verificationLink),
    }
    if (!GlobalHelper.getInstance().isEmpty(from)) {
      emailObj['from'] = from;
    }

    return await this.mailService.sendEmail(emailObj);
  }
  async processGoogleUser(googleUser: GoogleUserProfile) {
    if (!GlobalHelper.getInstance().isEmpty(googleUser)) {
      let user = await this.getUserByEmail(googleUser?.email);
      if (GlobalHelper.getInstance().isEmpty(user)) {
        const userObj = this.constructGoogleUserObject(googleUser);
        user = (await this.userModel.create(userObj)).toObject();
        return user;
      }
      else {
        if (user?.provider == Provider.CUSTOM) {
          ExceptionHelper.getInstance().defaultError(
            "user exist with this email",
            "user_exist_with_this_email",
            HttpStatus.CONFLICT
          )
        }
        else {
          return user;
        }
      }
    }
    else {
      ExceptionHelper.getInstance().noDataFound();
    }
  }


  private constructGoogleUserObject(googleUser: GoogleUserProfile) {
    return {
      name: googleUser.name ?? '',
      email: googleUser.email ?? '',
      phone: '',
      password: '',
      userType: UserType.CUSTOMER,
      salt: '',
      verificationCode: '',
      resetCode: '',
      isVerified: true,
      status: Status.ACTIVE,
      provider: Provider.GOOGLE,
    };
  }
  async googleLoginCallback(user: IUser): Promise<{ user: IUser; tokens: JwtTokens; }> {
    try {
      const returnUser = this.constructReturnUserObj(user);
      return returnUser;
    } catch (error) {
      ExceptionHelper.getInstance().defaultError(
        error?.message,
        error?.message?.split("").join("_"),
        error?.status ?? HttpStatus.BAD_REQUEST
      )
    }
  }
}
