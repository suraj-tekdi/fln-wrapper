import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 6002);
  console.log(`Server started on port ${process.env.PORT || 6002}`);
}
bootstrap();
