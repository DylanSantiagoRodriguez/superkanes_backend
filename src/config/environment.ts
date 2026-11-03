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
    ...validateAuth(input),
    ...validateStorage(input),
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

function validateAuth(input: Record<string, unknown>) {
  const secret =
    typeof input.AUTH_JWT_SECRET === 'string'
      ? input.AUTH_JWT_SECRET.trim()
      : '';
  if (
    !/^[A-Za-z0-9+/]{86}==$/.test(secret) ||
    Buffer.from(secret, 'base64').length !== 64
  )
    throw new Error(
      'AUTH_JWT_SECRET requiere 64 bytes aleatorios en base64; ejecute auth:setup',
    );
  const issuer =
    typeof input.AUTH_ISSUER === 'string' && input.AUTH_ISSUER.trim()
      ? input.AUTH_ISSUER.trim()
      : 'superkanes-api';
  const audience =
    typeof input.AUTH_AUDIENCE === 'string' && input.AUTH_AUDIENCE.trim()
      ? input.AUTH_AUDIENCE.trim()
      : 'superkanes-clients';
  return {
    AUTH_JWT_SECRET: secret,
    AUTH_ISSUER: issuer,
    AUTH_AUDIENCE: audience,
  };
}

function validateStorage(input: Record<string, unknown>) {
  const enabled = input.S3_ENABLED ?? 'false';
  if (typeof enabled !== 'string' || !['true', 'false'].includes(enabled))
    throw new Error('Invalid S3_ENABLED');
  const bucket = input.S3_BUCKET ?? 'superkanes';
  if (
    typeof bucket !== 'string' ||
    !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)
  )
    throw new Error('Invalid S3_BUCKET');
  if (enabled === 'true') {
    for (const name of ['S3_ENDPOINT', 'S3_ACCESS_KEY', 'S3_SECRET_KEY']) {
      if (
        typeof input[name] !== 'string' ||
        !input[name] ||
        String(input[name]).startsWith('REPLACE_')
      )
        throw new Error(`Missing or invalid ${name}`);
    }
    const endpoint = new URL(String(input.S3_ENDPOINT));
    if (
      !['http:', 'https:'].includes(endpoint.protocol) ||
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash ||
      endpoint.pathname !== '/'
    )
      throw new Error('Invalid S3_ENDPOINT');
    if (String(input.S3_SECRET_KEY).length < 16)
      throw new Error('Invalid S3_SECRET_KEY');
  }
  return {
    S3_ENABLED: enabled === 'true',
    S3_BUCKET: bucket,
    S3_REGION:
      typeof input.S3_REGION === 'string' && input.S3_REGION.trim()
        ? input.S3_REGION.trim()
        : 'us-east-1',
  };
}
