import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    // Log the request
    this.logger.log(
      `[REQUEST] ${method} ${originalUrl} - ${ip} - ${userAgent}`,
      'HttpLogger',
    );

    // Track response time
    const start = Date.now();

    // Log the response when it's sent
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;
      const responseTime = Date.now() - start;

      // Format log based on status code
      if (statusCode >= 500) {
        this.logger.error(
          `[RESPONSE] ${method} ${originalUrl} - ${statusCode} - ${contentLength} - ${responseTime}ms`,
          undefined,
          'HttpLogger',
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `[RESPONSE] ${method} ${originalUrl} - ${statusCode} - ${contentLength} - ${responseTime}ms`,
          'HttpLogger',
        );
      } else {
        this.logger.log(
          `[RESPONSE] ${method} ${originalUrl} - ${statusCode} - ${contentLength} - ${responseTime}ms`,
          'HttpLogger',
        );
      }
    });

    next();
  }
}
