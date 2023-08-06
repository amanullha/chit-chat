import { JwtStrategy } from '@decorators/jwt.strategy';
import { DB_tables } from '@models/dbTable.enum';
import { MailService } from '@modules/mail/mail.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from '@schemas/user.schema';
import * as dotenv from 'dotenv';
import { UserController } from './user.controller';
import { UserService } from './user.service';
dotenv.config();
@Module({
  imports: [
    MongooseModule.forFeature([{ name: DB_tables.USER, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.REFRESH_TOKEN_VALIDITY },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, MailService],
  exports: [JwtStrategy, PassportModule],
})
export class UserModule { }
