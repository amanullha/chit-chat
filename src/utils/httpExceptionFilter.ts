import { GlobalHelper } from '@helpers/global.helper';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    let exceptionMessages = exception['response']['message'];
    let message = '';
    let errorCodes = [];
    if (Array.isArray(exceptionMessages)) {
      message = exceptionMessages.join(', ');
    } else {
      message = exceptionMessages;
    }
    if (!GlobalHelper.getInstance().isEmpty(exceptionMessages)) {
      if (Array.isArray(exceptionMessages) && exceptionMessages.length > 1) {
        for (let i = 0; i < exceptionMessages.length; i++) {
          errorCodes.push(
            exceptionMessages[i].replaceAll(' ', '_').toLowerCase(),
          );
        }
      } else if (
        Array.isArray(exceptionMessages) &&
        exceptionMessages.length == 1
      ) {
        errorCodes = exceptionMessages[0].replaceAll(' ', '_').toLowerCase();
      } else {
        errorCodes = exceptionMessages.replaceAll(' ', '_').toLowerCase();
      }
    }

    response.status(status).json({
      status: status,
      errorCode: exception['response']['errorCode'] ?? errorCodes,
      message: message,
      data: exception['response']['data'] ?? {},
    });
  }
}
