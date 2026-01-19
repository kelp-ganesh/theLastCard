import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('DB_HOST');
    const port = this.configService.get<number>('DB_PORT');
    console.log(`Connecting to DB at ${host}:${port}`);
  }
}
