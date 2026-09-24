import { validateEnvironment } from './environment';

describe('Environment validation', () => {
  const valid = {
    POSTGRES_APP_PASSWORD: 'test-secret-not-for-production',
    NODE_ENV: 'test',
  };
  it('rechaza contrasenas ausentes o placeholders', () => {
    expect(() => validateEnvironment({})).toThrow('POSTGRES_APP_PASSWORD');
    expect(() =>
      validateEnvironment({
        POSTGRES_APP_PASSWORD: 'REPLACE_WITH_RANDOM_APP_PASSWORD',
      }),
    ).toThrow();
  });
  it('rechaza puertos invalidos y origenes comodin', () => {
    expect(() => validateEnvironment({ ...valid, PORT: '65536' })).toThrow(
      'PORT',
    );
    expect(() => validateEnvironment({ ...valid, CORS_ORIGINS: '*' })).toThrow(
      'CORS_ORIGINS',
    );
  });
  it('transforma puertos y desactiva swagger por defecto en produccion', () => {
    const result = validateEnvironment({ ...valid, NODE_ENV: 'production' });
    expect(result.PORT).toBe(3000);
    expect(result.SWAGGER_ENABLED).toBe(false);
  });
});
