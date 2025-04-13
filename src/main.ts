import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Soother Finance API')
    .setDescription('The Soother Finance Oracle Protocol API documentation')
    .setVersion('1.0')
    .addTag('oracles')
    .addTag('subscriptions')
    .addTag('dashboard')
    .addBearerAuth()
    .addApiKey()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
