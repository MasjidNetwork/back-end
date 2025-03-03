import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';

async function generateDocumentation() {
  const logger = new Logger('DocGenerator');
  logger.log('Generating API documentation...');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

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

  // Create docs directory
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Save Swagger JSON
  const swaggerJsonPath = path.join(docsDir, 'swagger.json');
  fs.writeFileSync(
    swaggerJsonPath,
    JSON.stringify(document, null, 2)
  );
  logger.log(`Swagger JSON exported to: ${swaggerJsonPath}`);

  // Create postman directory
  const postmanDir = path.join(process.cwd(), 'postman');
  if (!fs.existsSync(postmanDir)) {
    fs.mkdirSync(postmanDir, { recursive: true });
  }

  // Export Postman collection
  const postmanCollectionPath = path.join(postmanDir, 'masjid-network-api.postman_collection.json');
  fs.writeFileSync(
    postmanCollectionPath,
    JSON.stringify(document, null, 2)
  );
  logger.log(`Postman collection exported to: ${postmanCollectionPath}`);

  // Generate HTML documentation
  logger.log('To view the Swagger UI, run the application and visit /api/docs');
  
  await app.close();
  logger.log('Documentation generation complete!');
}

generateDocumentation().catch(err => {
  console.error('Error generating documentation:', err);
  process.exit(1);
}); 