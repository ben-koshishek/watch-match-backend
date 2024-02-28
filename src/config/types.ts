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
