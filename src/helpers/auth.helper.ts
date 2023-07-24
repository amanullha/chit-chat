import { IUser, JwtTokens } from '@interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TEN_MINS_IN_MILL_SECONDS } from './globalConstants';
import * as dotenv from 'dotenv';
import { LoginRequestType, UserLoginDto } from '@modules/user/dto/userLoginDto';
import { GlobalHelper } from './global.helper';
import { Model } from 'mongoose';
dotenv.config();
import { User, UserDocument, UserSchema } from '@schemas/user.schema';

export class AuthHelper {
  private static instance: AuthHelper;
  static getInstance(): AuthHelper {
    AuthHelper.instance = AuthHelper.instance || new AuthHelper();
    return AuthHelper.instance;
  }
  async generateHash(value: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(value, salt);
    return hash;
  }
  async compareHash(value: string, hash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(value, hash);
    return isMatch;
  }
  async generateTokens(user: IUser, jwt: JwtService): Promise<JwtTokens> {
    return {
      accessToken: await this.generateAccessToken(user, jwt),
      refreshToken: await this.generateRefreshToken(user, jwt),
    };
  }

  async generateAccessToken(user: IUser, jwt: JwtService): Promise<string> {
    let body = {
      email: user.email,
      _id: user._id,
      userType: user.userType,
    };
    const accessToken = await this.generateToken(
      body,
      jwt,
      TEN_MINS_IN_MILL_SECONDS,
    );
    return accessToken;
  }
  async generateRefreshToken(user: IUser, jwt: JwtService) {
    let body = {
      email: user.email,
      _id: user._id,
      userType: user.userType,
    };
    const refreshToken = await this.generateToken(
      body,
      jwt,
      process.env.ACCESS_TOKEN_VALIDITY,
    );
    return refreshToken;
  }

  async generateToken(
    body: any,
    jwt: JwtService,
    expireTime: any,
  ): Promise<string> {
    const token = jwt.sign(body, { expiresIn: expireTime });
    return token;
  }
  async verify(
    userLoginDto: UserLoginDto,
    // userModel: Model<typeof UserSchema>,
    userModel: Model<UserDocument>,
    jwt: JwtService,
  ): Promise<IUser> {
    let user: IUser = null;
    if (userLoginDto.type == LoginRequestType.Email) {
      const users:IUser[] = await userModel
        .find({email:userLoginDto.email})
        .exec();
      user = GlobalHelper.getInstance().arrayFirstOrNull(users);
    } else if (userLoginDto.type == LoginRequestType.Refresh) {
      const secretKey = String(process.env.JWT_SECRET);
      try {
        const decodedToken = jwt.verify(userLoginDto.refreshToken, {
          secret: secretKey,
        });
        if (!GlobalHelper.getInstance().isEmpty(decodedToken)) {
          const users: IUser[] = await userModel
            .find({email:decodedToken['body']['email']})
            .exec();
          user = GlobalHelper.getInstance().arrayFirstOrNull(users);
        }
      } catch (error) {
        user = null;
      }
    }
    return user;
    // const token = jwt.sign(body, { expiresIn: expireTime });
    // return token;
  }
}
