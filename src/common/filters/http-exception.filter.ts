import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Get the error message
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            message: exception.message || 'Internal server error',
            statusCode: status,
          };

    // Stack trace for non-production environments
    const stack =
      process.env.NODE_ENV !== 'production' ? exception.stack : undefined;

    // Create response body
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === 'object' ? message : { message }),
    };

    // Log the error
    if (status >= 500) {
      this.loggerService.error(
        `[${request.method}] ${request.url} - ${status} - ${JSON.stringify(responseBody)}`,
        stack,
        'HttpException',
      );
    } else {
      this.loggerService.warn(
        `[${request.method}] ${request.url} - ${status} - ${JSON.stringify(responseBody)}`,
        'HttpException',
      );
    }

    // Send response
    response.status(status).json(responseBody);
  }
}
