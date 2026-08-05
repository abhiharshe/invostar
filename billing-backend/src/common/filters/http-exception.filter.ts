import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException ? exception.getResponse() : null;
    const details =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? exceptionResponse
        : null;
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (details?.['message'] ?? 'Internal server error');

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors: details?.['message'] instanceof Array ? details['message'] : null,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
