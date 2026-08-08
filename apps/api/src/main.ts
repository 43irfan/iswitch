import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser') as () => import('express').RequestHandler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const origin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({ origin, credentials: true });
  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`iSwitch API listening on http://localhost:${port}`);
}

bootstrap();
