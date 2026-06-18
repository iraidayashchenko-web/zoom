export const configuration = () => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',').map((origin) => origin.trim()).filter(Boolean),
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me-dev-secret-change-me',
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
    refreshTokenDays: Number(process.env.REFRESH_TOKEN_DAYS ?? 30),
    passwordResetTtlSeconds: Number(process.env.PASSWORD_RESET_TTL_SECONDS ?? 3600),
    emailVerificationTtlSeconds: Number(process.env.EMAIL_VERIFICATION_TTL_SECONDS ?? 86400),
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? 'us-east-1',
    bucket: process.env.S3_BUCKET ?? 'novameet',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
  },
});

export type AppConfiguration = ReturnType<typeof configuration>;
