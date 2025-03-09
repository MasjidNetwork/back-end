import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // Extract error details
    let errorMessage = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let errorDetails = {};

    if (typeof errorResponse === 'object') {
      const errorObj = errorResponse as any;
      errorMessage = errorObj.message || errorMessage;
      
      // Map HTTP status codes to error codes
      switch (status) {
        case HttpStatus.UNAUTHORIZED:
          errorCode = 'AUTH_001';
          break;
        case HttpStatus.FORBIDDEN:
          errorCode = 'AUTH_003';
          break;
        case HttpStatus.NOT_FOUND:
          errorCode = 'RESOURCE_001';
          break;
        case HttpStatus.CONFLICT:
          errorCode = 'RESOURCE_002';
          break;
        case HttpStatus.BAD_REQUEST:
          errorCode = 'VALIDATION_001';
          break;
        default:
          errorCode = `ERROR_${status}`;
      }

      // Include validation errors if available
      if (errorObj.errors) {
        errorDetails = { validationErrors: errorObj.errors };
      }
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status}: ${errorMessage}`,
      JSON.stringify(errorDetails),
      'HttpException',
    );

    // Return standardized error response
    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: errorDetails,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
