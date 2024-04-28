import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';
import { appConfig } from 'src/configs/app.config';

@Injectable()
export class ChatService {
  private openai: OpenAIApi;

  constructor(
    @Inject(appConfig.KEY) private configs: ConfigType<typeof appConfig>,
  ) {
    const apiKey = this.configs.openAiApiKey;
    const configuration = new Configuration({ apiKey });
    this.openai = new OpenAIApi(configuration);
  }

  async send(text: string): Promise<string> {
    try {
      const result = await this.openai.createChatCompletion({
        n: 1,
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'soy un bot, me llamo ARCHIE' },
          { role: 'system', content: 'solo dare respuestas muy cortas' },
          { role: 'system', content: 'me expreso como mexicano' },
          { role: 'user', content: text || '' },
        ],
      });
      return result?.data?.choices?.[0]?.message?.content;
    } catch (err) {
      Logger.error('Error on ChatGPT response');
      throw err;
    }
  }
}
