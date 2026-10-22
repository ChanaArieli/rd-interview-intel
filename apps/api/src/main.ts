import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Enable CORS for local development
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.API_PORT || 3001;
  await app.listen(port, () => {
    console.log(`🚀 API server running on http://localhost:${port}/api`);
  });
}

bootstrap();
