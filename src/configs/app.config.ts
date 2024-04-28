import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT) || 3001,
  authInfoPath: process.env.AUTH_INFO_DIR || './auth_info',
  openAiApiKey: process.env.OPENAI_API_KEY,
}));
