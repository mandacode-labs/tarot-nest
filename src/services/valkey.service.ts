import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { Config } from 'src/config/config.schema';

@Injectable()
export class ValkeyService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ValkeyService.name);
  private client: Redis | null = null;
  private cacheConfig: Config['cache'];

  constructor(private readonly config: ConfigService<Config, true>) {
    this.cacheConfig = this.config.get<Config['cache']>('cache');
  }

  onModuleInit() {
    if (!this.cacheConfig.enabled) {
      this.logger.log('Cache is disabled');
      return;
    }

    const { host, port, password, db } = this.cacheConfig.valkey;

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      db,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    this.client.on('error', (err) => {
      this.logger.error(`Valkey connection error: ${err.message}`);
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to Valkey at ${host}:${port}`);
    });

    this.client.connect().catch((err) => {
      this.logger.error(`Failed to connect to Valkey: ${err.message}`);
      this.client = null;
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  isEnabled(): boolean {
    return this.cacheConfig.enabled && this.client !== null;
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (err) {
      this.logger.warn(
        `Cache GET failed for key ${key}: ${(err as Error).message}`,
      );
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) {
      return;
    }

    const ttl = ttlSeconds ?? this.cacheConfig.ttl;

    try {
      await this.client.set(key, value, 'EX', ttl);
    } catch (err) {
      this.logger.warn(
        `Cache SET failed for key ${key}: ${(err as Error).message}`,
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}
