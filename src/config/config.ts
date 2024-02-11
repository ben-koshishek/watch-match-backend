export interface DatabaseConfig {
  host: string;
  port: number;
}

export interface AuthConfig {
  secret: string;
  expiresIn: string;
}

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface Config {
  port: number;
  database: DatabaseConfig;
  auth: AuthConfig;
  google: GoogleConfig;
}

export default (): Config => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
  auth: {
    secret: process.env.AUTH_SECRET || 'secret',
    expiresIn: process.env.AUTH_EXPIRES_IN || '36000',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'test_client',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
  },
});
