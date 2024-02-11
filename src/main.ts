import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.error(process.env.DB_HOST, process.env.DB_NAME)
  console.error('qweqwqwe');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
