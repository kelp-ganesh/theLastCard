import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { PlayerModel } from './models/player.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),  
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        // host: config.get<string>('DB_HOST'),
        // port: config.get<number>('DB_PORT'),
        // username: config.get<string>('DB_USER'),
        // password: config.get<string>('DB_PASS'),
        // database: config.get<string>('DB_NAME'),
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        models: [PlayerModel], 
        autoLoadModels: true,
        synchronize: true,
      }),
      
    }),
    SequelizeModule.forFeature([PlayerModel]),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}

