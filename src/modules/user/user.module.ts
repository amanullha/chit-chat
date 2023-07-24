import { GlobalHelper } from '@helpers/global.helper';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { DB_tables } from '@models/dbTable.enum';
import * as dotenv from 'dotenv';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@decorators/jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@schemas/user.schema';
dotenv.config();
@Module({
  imports: [
    MongooseModule.forFeature([{ name:DB_tables.USER, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.REFRESH_TOKEN_VALIDITY },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class UserModule {}
