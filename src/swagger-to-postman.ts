import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('SwaggerToPostman');
  logger.log('Generating Postman collection from Swagger documentation...');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

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
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication and authorization endpoints')
    .addTag('users', 'User management operations')
    .addTag('masjids', 'Mosque/masjid management operations')
    .addTag('campaigns', 'Fundraising campaign management operations')
    .addTag('donations', 'Donation processing operations')
    .addTag('payments', 'Payment processing operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Ensure the postman directory exists
  const postmanDir = path.join(__dirname, '..', 'postman');
  if (!fs.existsSync(postmanDir)) {
    fs.mkdirSync(postmanDir, { recursive: true });
    logger.log(`Created directory: ${postmanDir}`);
  }

  // Enhance the OpenAPI document with Postman-specific extensions
  const enhancedDocument = enhanceDocumentForPostman(document);

  // Write the Swagger JSON to a file
  fs.writeFileSync(
    path.join(postmanDir, 'swagger.json'),
    JSON.stringify(enhancedDocument, null, 2),
  );

  // Create and save Postman environment
  const environment = createPostmanEnvironment();
  fs.writeFileSync(
    path.join(postmanDir, 'masjid-network-environment.json'),
    JSON.stringify(environment, null, 2),
  );

  // Generate Postman collection file
  fs.writeFileSync(
    path.join(postmanDir, 'masjid-network-api.postman_collection.json'),
    JSON.stringify(enhancedDocument, null, 2),
  );

  logger.log(
    `Swagger JSON exported to: ${path.join(postmanDir, 'swagger.json')}`,
  );
  logger.log(
    `Postman environment exported to: ${path.join(postmanDir, 'masjid-network-environment.json')}`,
  );
  logger.log(
    `Postman collection exported to: ${path.join(postmanDir, 'masjid-network-api.postman_collection.json')}`,
  );

  await app.close();
}

/**
 * Enhances the OpenAPI document with Postman-specific extensions
 */
function enhanceDocumentForPostman(document: any) {
  // Add Postman collection info
  document.info['x-postman-collection'] = {
    name: 'Masjid Network API',
    description: 'API for the Masjid Network platform',
    schema:
      'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  };

  // Add folder structure based on tags
  if (document.tags) {
    document.tags.forEach((tag: any) => {
      // Find all paths that have operations with this tag
      Object.keys(document.paths).forEach((path) => {
        const pathItem = document.paths[path];
        Object.keys(pathItem).forEach((method) => {
          const operation = pathItem[method];
          if (operation.tags && operation.tags.includes(tag.name)) {
            // Add folder info to the operation
            operation['x-postman-folder'] = tag.name;
          }
        });
      });
    });
  }

  // Add authentication examples
  if (document.components && document.components.securitySchemes) {
    const securitySchemes = document.components.securitySchemes;
    if (securitySchemes['JWT-auth']) {
      securitySchemes['JWT-auth']['x-postman-variable'] = 'jwt_token';
    }
  }

  return document;
}

/**
 * Creates a Postman environment with commonly used variables
 */
function createPostmanEnvironment() {
  return {
    id: 'masjid-network-environment',
    name: 'Masjid Network Environment',
    values: [
      {
        key: 'base_url',
        value: 'http://localhost:3000/api',
        type: 'string',
        enabled: true,
      },
      {
        key: 'jwt_token',
        value: '',
        type: 'string',
        enabled: true,
      },
      {
        key: 'user_id',
        value: '',
        type: 'string',
        enabled: true,
      },
      {
        key: 'masjid_id',
        value: '',
        type: 'string',
        enabled: true,
      },
      {
        key: 'campaign_id',
        value: '',
        type: 'string',
        enabled: true,
      },
    ],
  };
}

bootstrap();
