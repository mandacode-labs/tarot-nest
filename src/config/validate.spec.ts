import { validate } from './validate';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

const mockReadFileSync = jest.requireMock('fs').readFileSync as jest.Mock;

const originalEnv = process.env;

describe('validate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return config with defaults when YAML is missing', () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const result = validate({});

    expect(result.server.port).toBe(3000);
    expect(result.server.nodeEnv).toBe('development');
    expect(result.openai.chatModel).toBe('gpt-4o-mini');
    expect(result.openai.apiKey).toBe('');
    expect(result.cache.enabled).toBe(true);
    expect(result.cache.ttl).toBe(3600);
    expect(result.tarot.cards.major.length).toBeGreaterThan(0);
  });

  it('should load YAML config successfully', () => {
    mockReadFileSync.mockReturnValue(`
server:
  port: 8080
cache:
  enabled: false
    `);

    const result = validate({});

    expect(result.server.port).toBe(8080);
    expect(result.cache.enabled).toBe(false);
    expect(result.server.nodeEnv).toBe('development');
  });

  it('should override config with environment variables', () => {
    mockReadFileSync.mockReturnValue('{}');
    process.env.OPENAI_API_KEY = 'sk-test-key';
    process.env.VALKEY_HOST = 'redis.example.com';
    process.env.VALKEY_PORT = '6380';

    const result = validate(process.env);

    expect(result.openai.apiKey).toBe('sk-test-key');
    expect(result.cache.valkey.host).toBe('redis.example.com');
    expect(result.cache.valkey.port).toBe(6380);
  });

  it('should prefer env vars over YAML values', () => {
    mockReadFileSync.mockReturnValue(`
cache:
  valkey:
    host: yaml-host
    port: 6379
    `);
    process.env.VALKEY_HOST = 'env-host';

    const result = validate(process.env);

    expect(result.cache.valkey.host).toBe('env-host');
    expect(result.cache.valkey.port).toBe(6379);
  });

  it('should apply defaults for nested objects', () => {
    mockReadFileSync.mockReturnValue('{}');

    const result = validate({});

    expect(result.cache.valkey.host).toBe('valkey');
    expect(result.cache.valkey.port).toBe(6379);
    expect(result.openai.chatModel).toBe('gpt-4o-mini');
  });
});
