export function validateEnvironment(input: Record<string, unknown>) {
  const text = (key: string, fallback?: string): string => {
    const value = input[key] ?? fallback;
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`Missing or invalid configuration: ${key}`);
    }
    return value.trim();
  };
  const integer = (key: string, fallback: string, max: number): number => {
    const raw = text(key, fallback);
    const value = Number(raw);
    if (
      !/^\d+$/.test(raw) ||
      !Number.isSafeInteger(value) ||
      value < 1 ||
      value > max
    ) {
      throw new Error(`Invalid integer configuration: ${key}`);
    }
    return value;
  };
  const environment = text('NODE_ENV', 'development');
  if (!['development', 'test', 'production'].includes(environment)) {
    throw new Error('Invalid NODE_ENV');
  }
  const password = text('POSTGRES_APP_PASSWORD');
  if (password.length < 16 || password.startsWith('REPLACE_')) {
    throw new Error(
      'POSTGRES_APP_PASSWORD must be configured (minimum 16 characters)',
    );
  }
  const swagger = text(
    'SWAGGER_ENABLED',
    environment === 'production' ? 'false' : 'true',
  );
  if (!['true', 'false'].includes(swagger))
    throw new Error('Invalid SWAGGER_ENABLED');
  const origins = text('CORS_ORIGINS', 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim());
  for (const origin of origins) {
    let url: URL;
    try {
      url = new URL(origin);
    } catch {
      throw new Error('Invalid CORS_ORIGINS');
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) {
      throw new Error('CORS_ORIGINS must contain explicit HTTP(S) origins');
    }
  }
  return {
    ...input,
    ...validateAuth(input, environment),
    NODE_ENV: environment,
    PORT: integer('PORT', '3000', 65535),
    DB_HOST: text('DB_HOST', '127.0.0.1'),
    POSTGRES_PORT: integer('POSTGRES_PORT', '5432', 65535),
    POSTGRES_DB: text('POSTGRES_DB', 'superkanes'),
    POSTGRES_APP_PASSWORD: password,
    DB_POOL_MAX: integer('DB_POOL_MAX', '10', 100),
    CORS_ORIGINS: origins,
    SWAGGER_ENABLED: swagger === 'true',
  };
}

function validateAuth(input: Record<string, unknown>, environment: string) {
  const keys = ['AUTH_ISSUER', 'AUTH_AUDIENCE', 'AUTH_JWKS_URI'];
  const values = keys.map((key) =>
    typeof input[key] === 'string' ? input[key].trim() : '',
  );
  if (values.some(Boolean) && !values.every(Boolean))
    throw new Error(
      'Configure AUTH_ISSUER, AUTH_AUDIENCE y AUTH_JWKS_URI juntos',
    );
  if (values.every(Boolean)) {
    for (const value of [values[0], values[2]]) {
      const url = new URL(value);
      if (
        url.username ||
        url.password ||
        url.hash ||
        !['https:', 'http:'].includes(url.protocol)
      )
        throw new Error('URL de autenticacion invalida');
      if (environment === 'production' && url.protocol !== 'https:')
        throw new Error('Autenticacion requiere HTTPS en produccion');
    }
  }
  return Object.fromEntries(
    keys.map((key, index) => [key, values[index] || undefined]),
  );
}
