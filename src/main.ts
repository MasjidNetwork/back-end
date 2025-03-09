import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger/logger.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);

  // Use our custom logger
  app.useLogger(logger);

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  logger.log('Application starting...', 'Bootstrap');

  // Enable CORS
  const corsOrigins = configService
    .get<string>('CORS_ORIGIN', 'http://localhost:5173')
    ?.split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix with versioning
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Masjid Network API')
    .setDescription(
      `
      # API Documentation for the Masjid Network Platform
      
      This API serves as the backend for the Masjid Network platform, providing functionality for mosques/masjids, 
      fundraising campaigns, user management, and payment processing.
      
      ## Features:
      - User authentication and management
      - Masjid/mosque profiles and administration
      - Fundraising campaigns and donation processing
      - Payment handling and webhook integration
      
      ## Authentication
      Most endpoints require authentication using a JWT Bearer token. 
      To authenticate, first use the /auth/login endpoint to obtain a token.
      
      ## API Versioning
      All endpoints are prefixed with /api/v1 to support future versioning.
      
      ## Getting Started
      Explore the available endpoints using this Swagger UI, or import the Postman collection 
      from the /postman directory.
      
      ## Standard Response Format
      All API responses follow a standard format:
      
      Success response:
      \`\`\`json
      {
        "success": true,
        "data": { ... },
        "meta": {
          "pagination": { ... }
        }
      }
      \`\`\`
      
      Error response:
      \`\`\`json
      {
        "success": false,
        "error": {
          "code": "ERROR_CODE",
          "message": "Human-readable error message",
          "details": { ... }
        }
      }
      \`\`\`
    `,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication and authorization endpoints')
    .addTag('users', 'User profile and management endpoints')
    .addTag('masjids', 'Mosque/masjid management and administration')
    .addTag(
      'campaigns',
      'Fundraising campaign management and donation operations',
    )
    .addTag('payments', 'Payment processing and financial transactions')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  // Export Postman collection
  const outputDir = path.join(process.cwd(), 'postman');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const postmanCollectionPath = path.join(
    outputDir,
    'masjid-network-api.postman_collection.json',
  );
  fs.writeFileSync(
    postmanCollectionPath,
    JSON.stringify(SwaggerModule.createDocument(app, config), null, 2),
  );
  logger.log(
    `Postman collection exported to ${postmanCollectionPath}`,
    'Bootstrap',
  );

  // Start the server
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  logger.log(
    `Swagger documentation available at: http://localhost:${port}/api/v1/docs`,
    'Bootstrap',
  );
}
bootstrap();
