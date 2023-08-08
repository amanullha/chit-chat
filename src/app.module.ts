import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventGateway } from './modules/event/event.gateway';
import { MailModule } from './modules/mail/mail.module';
import { UserModule } from './modules/user/user.module';
dotenv.config();



@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'google' }),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.glivwet.mongodb.net/${process.env.SERVER_TYPE}chitchat?retryWrites=true&w=majority`, {
      // Optional configuration options
    }),
    UserModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, EventGateway],
})
export class AppModule { }
