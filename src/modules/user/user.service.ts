import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/createUserDto';
import { IUser, IUserKey, JwtTokens } from '@interfaces/user.interface';
import { GlobalHelper } from '@helpers/global.helper';
import { UserType } from '@models/userType.enum';
import { Status } from '@models/status.enum';
import { ExceptionHelper } from '@helpers/exception.helper';
import { DB_tables } from '@models/dbTable.enum';

import { AuthHelper } from '@helpers/auth.helper';
import * as dotenv from 'dotenv';
import { JwtService } from '@nestjs/jwt';
import { LoginRequestType, UserLoginDto } from './dto/userLoginDto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AllUserDto } from './dto/allUserDto';
import { UpdateProfileDto } from './dto/updateProfile';
import { User, UserDocument } from '@schemas/user.schema';

dotenv.config();
@Injectable()
export class UserService {
  constructor(
    @InjectModel(DB_tables.USER) private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
    userType?: UserType,
  ): Promise<{ user: IUser; tokens: JwtTokens }> {
    try {
      const obj = await this.constructCreateUserObj(createUserDto, userType);
      let user: IUser = (await this.userModel.create(obj)).toObject();
      const returnUser = this.constructReturnUserObj(user);
      return returnUser;
    } catch (error) {
      this.resolveError(error);
    }
  }
  private resolveError(error: any) {
    if (error?.code == '11000') {
      ExceptionHelper.getInstance().throwDuplicateException(
        'User_exist_with_this_email',
      );
    }

    ExceptionHelper.getInstance().defaultError(
      error?.message,
      error?.message,
      error?.code,
    );
  }

  async getUserByEmail(email: string): Promise<IUser> {
    if (!GlobalHelper.getInstance().isEmpty(email)) {
      const user = (
        await this.userModel.findOne({ email: email }).exec()
      ).toObject();
      return user || null;
    }
    return null;
  }

  private async constructCreateUserObj(
    createUserDto: CreateUserDto,
    userType?: UserType,
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
      isVerified: userType ? true : false,
      status: Status.ACTIVE,
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
    return await this.userModel.findById({ _id: userId });
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
    let updateUser = await this.userModel
      .findByIdAndUpdate({ _id: user._id }, obj, { new: true })
      .lean()
      .exec();
    return updateUser;
  }
}
