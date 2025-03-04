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
    .setDescription(
      `
# Masjid Network API

## Overview
The Masjid Network API provides a comprehensive backend for managing mosques (masjids), fundraising campaigns, donations, and user accounts. This platform connects mosques with their communities and facilitates fundraising for various projects and initiatives.

## Features
- User authentication and management
- Masjid/mosque profiles and administration
- Fundraising campaigns
- Donation processing
- Payment handling

## Authentication
Most endpoints require authentication using JWT Bearer tokens.

To obtain a token, use the /auth/login endpoint with valid credentials.
Include the token in the Authorization header: \`Bearer your_token_here\`

## Getting Started
1. Register a user account via /auth/register
2. Login to obtain a JWT token via /auth/login
3. Use the token to access protected endpoints
    `,
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .addTag('auth', 'Authentication and authorization endpoints')
    .addTag('users', 'User management operations')
    .addTag('masjids', 'Mosque/masjid management operations')
    .addTag('campaigns', 'Fundraising campaign management operations')
    .addTag('donations', 'Donation processing operations')
    .addTag('payments', 'Payment processing operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Create docs directory
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
    logger.log(`Created directory: ${docsDir}`);
  }

  // Save Swagger JSON
  const swaggerJsonPath = path.join(docsDir, 'swagger.json');
  fs.writeFileSync(swaggerJsonPath, JSON.stringify(document, null, 2));
  logger.log(`Swagger JSON exported to: ${swaggerJsonPath}`);

  // Generate HTML documentation
  logger.log('To view the Swagger UI, run the application and visit /api/docs');

  await app.close();
  logger.log('Documentation generation complete!');
}

generateDocumentation().catch((err) => {
  console.error('Error generating documentation:', err);
  process.exit(1);
});
