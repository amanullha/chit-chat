import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { UserService } from '@modules/user/user.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly userService: UserService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ['profile', 'email'],
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const googleUserProfile = profile?._json;
        const user = await this.userService.processGoogleUser(googleUserProfile);
        if (!user) {
            throw new UnauthorizedException();
        }
        done(null, user)
    }
}
