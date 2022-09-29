import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export class DatabaseConfigManager {
  constructor(private configService?: ConfigService) {}

  private get(name): string {
    if (this.configService) return this.configService.get<string>(name);

    return process.env[name as keyof typeof process.env] ?? '';
  }

  private getOrThrow(name): string {
    if (this.configService) return this.configService.getOrThrow<string>(name);
    const value = process.env[name as keyof typeof process.env];
    if (value === undefined) throw new TypeError(`Undefined config ${name}`);
    return value;
  }

  getConnectionParameters(useTest = false): MongooseModuleFactoryOptions {
    if (useTest) {
      return {
        uri: 'mongodb://localhost:27017/pokemon-db-test',
      };
    } else if (this.get('PRODUCTION') === '1') {
      return {
        uri: this.getOrThrow('PRODUCTION_URI'),
        user: this.getOrThrow('PRODUCTION_USER'),
        pass: this.getOrThrow('PRODUCTION_PASS'),
      };
    } else {
      return {
        uri: 'mongodb://localhost:27017/pokemon-db',
      };
    }
  }
}
