# Masjid Network Backend

This is the backend service for the Masjid Network platform, built with NestJS, PostgreSQL, and Prisma.

## Features

- Authentication and user management
- Masjid profile management
- Campaign management
- Payment processing
- Content management

## Prerequisites

- Node.js (v18+)
- Yarn
- PostgreSQL
- Docker (optional)

## Getting Started

### Local Development

1. Install dependencies:

```bash
yarn install
```

2. Set up environment variables:

Copy the `.env.example` file to `.env` and update the values as needed.

3. Run database migrations:

```bash
yarn prisma migrate dev
```

4. Start the development server:

```bash
yarn start:dev
```

The API will be available at http://localhost:3000/api.
API documentation will be available at http://localhost:3000/api/docs.

### Using Docker

1. Start the services using Docker Compose:

```bash
docker-compose up -d
```

2. Run database migrations:

```bash
docker-compose exec backend yarn prisma migrate dev
```

The API will be available at http://localhost:3000/api.
API documentation will be available at http://localhost:3000/api/docs.

## Project Structure

```
src/
├── auth/           # Authentication module
├── campaigns/      # Campaign management module
├── common/         # Shared utilities and decorators
├── config/         # Application configuration
├── masjids/        # Masjid management module
├── payments/       # Payment processing module
├── prisma/         # Prisma ORM configuration
├── users/          # User management module
├── app.module.ts   # Main application module
└── main.ts         # Application entry point
```

## API Documentation

The API documentation is generated using Swagger and is available at `/api/docs` when the server is running.

## Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
