import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Enable CORS for local development and production
  const allowedOrigins = [
    'http://localhost:4200',
    process.env.FRONTEND_URL || 'http://localhost:4200'
  ];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.API_PORT || 3001;
  await app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 API server running on port ${port}/api`);
  });
}

bootstrap();
