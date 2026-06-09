import { ConfigService } from '@nestjs/config';
import { ValkeyService } from './valkey.service';

const mockRedis = {
  on: jest.fn().mockReturnThis(),
  connect: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn().mockResolvedValue(undefined),
  get: jest.fn(),
  set: jest.fn(),
  ping: jest.fn(),
};

jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn(() => mockRedis),
}));

function createService(enabled = true): ValkeyService {
  const config = {
    enabled,
    ttl: enabled ? 3600 : 3600,
    randomBucketSize: 10,
    valkey: {
      host: 'valkey',
      port: 6379,
      db: 0,
      password: undefined,
      prefix: undefined,
      username: undefined,
    },
  };

  const configService = {
    get: jest.fn().mockReturnValue(config),
  } as unknown as jest.Mocked<ConfigService>;

  return new ValkeyService(configService);
}

beforeEach(() => {
  mockRedis.on.mockReset();
  mockRedis.connect.mockReset();
  mockRedis.quit.mockReset();
  mockRedis.get.mockReset();
  mockRedis.set.mockReset();
  mockRedis.ping.mockReset();

  mockRedis.on.mockReturnThis();
  mockRedis.connect.mockResolvedValue(undefined);
  mockRedis.quit.mockResolvedValue(undefined);
});

describe('ValkeyService', () => {
  describe('onModuleInit', () => {
    it('should connect to Redis when cache is enabled', async () => {
      const service = createService();
      await service.onModuleInit();

      expect(mockRedis.connect).toHaveBeenCalled();
    });

    it('should skip connection when cache is disabled', async () => {
      const service = createService(false);
      await service.onModuleInit();

      expect(mockRedis.connect).not.toHaveBeenCalled();
    });

    it('should handle connection failure gracefully', async () => {
      mockRedis.connect.mockRejectedValue(new Error('connection refused'));

      const service = createService();
      await service.onModuleInit();

      expect(service.isEnabled()).toBe(false);
    });
  });

  describe('onModuleDestroy', () => {
    it('should quit Redis connection', async () => {
      const service = createService();
      await service.onModuleInit();

      expect(mockRedis.quit).not.toHaveBeenCalled();

      await service.onModuleDestroy();

      expect(mockRedis.quit).toHaveBeenCalled();
    });

    it('should handle destroy when client is null', async () => {
      const service = createService(false);
      await service.onModuleInit();
      await service.onModuleDestroy();

      expect(mockRedis.quit).not.toHaveBeenCalled();
    });
  });

  describe('isEnabled', () => {
    it('should return true when cache is enabled and client is connected', async () => {
      const service = createService();
      await service.onModuleInit();

      expect(service.isEnabled()).toBe(true);
    });

    it('should return false when cache is disabled', () => {
      const service = createService(false);

      expect(service.isEnabled()).toBe(false);
    });

    it('should return false when connection failed', async () => {
      mockRedis.connect.mockRejectedValue(new Error('fail'));

      const service = createService();
      await service.onModuleInit();

      expect(service.isEnabled()).toBe(false);
    });
  });

  describe('get', () => {
    it('should return cached value', async () => {
      mockRedis.get.mockResolvedValue('cached-value');

      const service = createService();
      await service.onModuleInit();

      const result = await service.get('test-key');

      expect(result).toBe('cached-value');
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when client is not available', async () => {
      const service = createService(false);
      await service.onModuleInit();

      const result = await service.get('test-key');

      expect(result).toBeNull();
    });

    it('should return null on Redis error', async () => {
      mockRedis.get.mockRejectedValue(new Error('timeout'));

      const service = createService();
      await service.onModuleInit();

      const result = await service.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value with TTL', async () => {
      const service = createService();
      await service.onModuleInit();

      await service.set('test-key', 'test-value');

      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key',
        'test-value',
        'EX',
        3600,
      );
    });

    it('should use custom TTL when provided', async () => {
      const service = createService();
      await service.onModuleInit();

      await service.set('test-key', 'test-value', 1800);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key',
        'test-value',
        'EX',
        1800,
      );
    });

    it('should not set when client is not available', async () => {
      const service = createService(false);
      await service.onModuleInit();

      await service.set('test-key', 'test-value');

      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return true when Redis PONG', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const service = createService();
      await service.onModuleInit();

      const result = await service.healthCheck();

      expect(result).toBe(true);
    });

    it('should return false when Redis does not PONG', async () => {
      mockRedis.ping.mockResolvedValue('ERROR');

      const service = createService();
      await service.onModuleInit();

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });

    it('should return false when client is not available', async () => {
      const service = createService(false);
      await service.onModuleInit();

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });
});
