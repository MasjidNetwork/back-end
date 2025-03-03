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
  const corsOrigins = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173')?.split(',');
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
  
  // API prefix
  app.setGlobalPrefix('api');
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Masjid Network API')
    .setDescription('API documentation for the Masjid Network platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('masjids', 'Masjid management endpoints')
    .addTag('campaigns', 'Campaign management endpoints')
    .addTag('payments', 'Payment processing endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Export Postman collection
  const outputDir = path.join(process.cwd(), 'postman');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const postmanCollectionPath = path.join(outputDir, 'masjid-network-api.postman_collection.json');
  fs.writeFileSync(
    postmanCollectionPath,
    JSON.stringify(SwaggerModule.createDocument(app, config), null, 2)
  );
  logger.log(`Postman collection exported to ${postmanCollectionPath}`, 'Bootstrap');
  
  // Start the server
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`, 'Bootstrap');
}
bootstrap();
