import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 
  
  app.enableCors({
    origin: ['http://localhost:4200','https://qd89949c-4200.inc1.devtunnels.ms'],

    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  });
   await app.listen(process.env.PORT ?? 3000,'0.0.0.0');
}
bootstrap();


