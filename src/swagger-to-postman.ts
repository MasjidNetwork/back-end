import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';

async function generatePostmanCollection() {
  const logger = new Logger('SwaggerToPostman');
  logger.log('Generating Postman collection from Swagger documentation...');

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

  // Export Postman collection
  const outputDir = path.join(process.cwd(), 'postman');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const postmanCollectionPath = path.join(outputDir, 'masjid-network-api.postman_collection.json');
  fs.writeFileSync(
    postmanCollectionPath,
    JSON.stringify(document, null, 2)
  );
  
  logger.log(`Postman collection has been generated: ${postmanCollectionPath}`);
  
  await app.close();
}

generatePostmanCollection().catch(err => {
  console.error('Error generating Postman collection:', err);
  process.exit(1);
}); 