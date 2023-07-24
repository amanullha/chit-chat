import { UserService } from '@modules/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv';
import { IAuthPayload } from '@interfaces/authPayload.interface';
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload:IAuthPayload): Promise<any> {
    const userEmail=payload.email??"";
    const user = await this.userService.getUserByEmail(userEmail);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
