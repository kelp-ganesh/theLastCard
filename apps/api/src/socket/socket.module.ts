import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { ChatGateway } from './socket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { DatabaseModule } from 'database';

@Module({
  providers: [ChatGateway, SocketService],
   imports: [
      PassportModule,
        DatabaseModule,
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          secret: config.get('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get('JWT_EXPIRES_IN'),
          },
        }),
      }),
    ],
})
export class SocketModule {}
