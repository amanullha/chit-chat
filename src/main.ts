import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { HttpExceptionFilter } from 'utils/httpExceptionFilter';
import { AppModule } from './app.module';
import { SocketAdapter } from '@helpers/socket.adapter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  const configService: ConfigService = app.get<ConfigService>(ConfigService);
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Use the Socket.io adapter
  // app.useWebSocketAdapter(new IoAdapter(
  //   app,
  //   // true,
  //   // {
  //   //   cors: {
  //   //     origin: true,
  //   //     credentials: true,
  //   //   },
  //   //   namespace: '/', // Set the default namespace to '/'
  //   //   // You can configure more namespaces and rooms here if needed
  //   // }
  // ));
  app.useWebSocketAdapter(new SocketAdapter(app));

  const port = configService.get('APP_PORT') ?? 3001;
  console.log('app running on port: ', port);
  await app.listen(port);
}
bootstrap();

/**
 1. app.use(helmet());
        -> Helmet can help protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately. 
        -> Generally, Helmet is just a collection of smaller middleware functions that set security-related HTTP headers (read more).

  2. app.useGlobalFilters(new HttpExceptionFilter());
        ->  captured the user unhandled error and format the error by the HttpExceptionFilter

  3. app.useGlobalPipes(new ValidationPipe());
        ->  transformation: transform input data to the desired form (e.g., from string to integer)
        ->  validation: evaluate input data and if valid, simply pass it through unchanged; otherwise, throw an exception





 */
