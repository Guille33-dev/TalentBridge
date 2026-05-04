import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PORT = 4000;
const DEFAULT_CORS_ORIGIN = 'http://localhost:3000';

function parsePort(value: string | undefined): number {
  if (!value) return DEFAULT_PORT;

  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
}

function parseCorsOrigins(value: string | undefined): string[] {
  return (value || DEFAULT_CORS_ORIGIN)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePort(process.env.PORT),
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
};
