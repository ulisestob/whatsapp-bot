import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { writeFile, unlink } from 'fs/promises';
import { createReadStream } from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import * as os from 'os';

import { appConfig } from 'src/configs/app.config';

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    @Inject(appConfig.KEY) private configs: ConfigType<typeof appConfig>,
  ) {
    const apiKey = this.configs.openAiApiKey;
    this.openai = new OpenAI({ apiKey });
  }

  async send(text: string, imageBase64: string): Promise<string> {
    try {
      const userMessages: Record<string, any>[] = [
        { type: 'text', text: text || '' },
      ];

      if (imageBase64) {
        userMessages.push({
          type: 'image_url',
          image_url: { url: imageBase64, detail: 'low' },
        });
      }

      const result = await this.openai.chat.completions.create({
        n: 1,
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: <any>[
              { type: 'text', text: 'soy un bot, me llamo ARCHIE.' },
              { type: 'text', text: 'soy creado por @ulisse.' },
              { type: 'text', text: 'solo dare respuestas muy cortas.' },
              { type: 'text', text: 'me expreso como mexicano.' },
            ],
          },
          {
            role: 'user',
            content: userMessages as any,
          },
        ],
      });
      return result?.choices?.[0]?.message?.content;
    } catch (err) {
      Logger.error('Error on ChatGPT response');
      throw err;
    }
  }

  async speechToText(audio: Buffer): Promise<string> {
    try {
      const timestamp = new Date().getTime();
      const tempFilePath = path.join(os.tmpdir(), `audio_${timestamp}.mp3`);
      await writeFile(tempFilePath, audio);
      const readStream = createReadStream(tempFilePath);
      const result = await this.openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: readStream,
      });
      await unlink(tempFilePath);
      return result?.text;
    } catch (err) {
      Logger.error('Error on ChatGPT response');
      throw err;
    }
  }
}
