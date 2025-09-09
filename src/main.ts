import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

// bootstrap이란 단어는 우리가 흔히 '컴퓨터 부팅한다'할 때 그 부팅을 의미합니다. 
// 따라서 '우리의 서버를 부팅한다', '우리의 서버를 켠다'라는 의미가 되겠네요.
bootstrap();
