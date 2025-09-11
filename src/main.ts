/**
 * PM2 실행 방법
 */


// src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global Validation Pipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Todo List API')
    .setDescription('MongoDB와 MySQL을 사용한 Todo List API')
    .setVersion('1.0')
    .addTag('📝 Todos MongoDB')
    .addTag('🗄️ Todos MySQL')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 4011;
  await app.listen(port);
  
  console.log(`🚀 서버가 http://localhost:${port}에서 실행 중입니다.`);
  console.log(`📚 API 문서: http://localhost:${port}/api`);
}

// bootstrap이란 단어는 우리가 흔히 '컴퓨터 부팅한다'할 때 그 부팅을 의미합니다. 
// 따라서 '우리의 서버를 부팅한다', '우리의 서버를 켠다'라는 의미가 되겠네요.
bootstrap();