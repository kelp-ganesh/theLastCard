import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from 'database';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SocketModule } from './socket/socket.module';

@Module({
 
  imports: [ ConfigModule.forRoot({
      isGlobal: true, 
    }),DatabaseModule, AuthModule, SocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
