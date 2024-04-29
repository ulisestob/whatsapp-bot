import { Injectable } from '@nestjs/common';
import { CommandName } from 'src/domain/enums/command-name.enum';
import { MessageResponseType } from 'src/domain/enums/message-response-type.enum';
import { MessageType } from 'src/domain/enums/message-type.enum';
import { RequestMessage } from 'src/domain/types/request-message.type';
import { ResponseMessage } from 'src/domain/types/response-message.type';
import { ChatService } from './chat.service';
import { FirebaseService } from './firebase.service';
import { MediaService } from './media.service';
import * as random from 'random-number';
import { BaileysClient } from 'src/infrastructure/proxies/baileys.proxy';

@Injectable()
export class MessageCommandService {
  constructor(
    private firebaseService: FirebaseService,
    private chatService: ChatService,
    private mediaService: MediaService,
    private baileysClient: BaileysClient,
  ) {}

  async handle(payload: RequestMessage): Promise<any> {
    const commands: Record<CommandName, (payload: RequestMessage) => any> = {
      [CommandName.PING]: (payload) => this.ping(payload),
      [CommandName.HELP]: (payload) => this.help(payload),
      [CommandName.STICKER]: (payload) => this.sticker(payload),
      [CommandName.INSULT]: (payload) => this.insult(payload),
      [CommandName.CHAT]: (payload) => this.chat(payload),
    };
    const text = payload?.message?.text || '';
    if (payload?.fromMe) return undefined;
    const command = this.getCommand(text);
    return commands?.[command]?.(payload);
  }

  private getCommand(text: string): CommandName {
    const keys = Object.keys(CommandName);
    for (const key of keys) {
      if (this.testPattern(CommandName[key], text)) return CommandName[key];
    }
  }

  private testPattern(pattern: string, text: string): boolean {
    const validator = new RegExp(`${pattern}\\b`, 'gi');
    return validator.test(text);
  }

  private ping(payload: RequestMessage): ResponseMessage {
    const { conversationId } = payload;
    return { conversationId, type: MessageResponseType.text, text: 'pong 🏓' };
  }

  private help(payload: RequestMessage): ResponseMessage {
    const { conversationId } = payload;
    const commands = [
      '*!ping*: _Envia una respuesta del servidor._',
      '*!help*: _Muestra el menu de commandos._',
      '*!sticker*: _Convierte cualquier imagen, gif, video en sticker._',
      '*!chat*: _Puedes conversar con chatgpt, (necesitas pedir acceso)(respuesta lenta)(beta)._',
      '*!insult*: _Envia un instulto a la persona que mencionas._',
    ].join(`\n`);
    const text = `⌘⌘⌘⌘⌘ *MENU* ⌘⌘⌘⌘⌘\n\n${commands}\n\n⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘`;
    return { conversationId, type: MessageResponseType.text, text };
  }

  private async sticker(payload: RequestMessage): Promise<ResponseMessage> {
    const { conversationId, message } = payload;
    if (!payload.message.media) return undefined;
    if (payload.message.type === MessageType.image) {
      const media = await this.mediaService.image(message.media);
      return { conversationId, type: MessageResponseType.sticker, media };
    }
    if (payload.message.type === MessageType.video) {
      const media = await this.mediaService.video(message.media);
      return { conversationId, type: MessageResponseType.sticker, media };
    }
    return undefined;
  }

  private async insult(payload: RequestMessage): Promise<ResponseMessage> {
    const { conversationId, message } = payload;
    const { mentions } = message;
    const people = mentions?.map((item) => '@' + item?.split('@')[0]);
    const insults = await this.firebaseService.getInsults();
    const index = random({ min: 0, max: insults.length - 1, integer: true });
    const text = `${insults[index]} ${people.join(' ')}`;
    if (!text) return undefined;
    return { conversationId, type: MessageResponseType.text, text, mentions };
  }

  private async chat(payload: RequestMessage): Promise<ResponseMessage> {
    const { conversationId, message } = payload;
    const extendedTextMessage = message?.['message']?.['extendedTextMessage'];
    const quotedMessage = extendedTextMessage?.['contextInfo'];
    const extraText = quotedMessage?.['quotedMessage']?.['conversation'] || '';
    const text = message?.text || '';
    const whitelist: string[] = await this.firebaseService.getWhiteList();
    const [conversationNumber] = payload?.conversationId?.split('@');
    const [userNumber] = payload?.userId?.split('@');
    const prompt = text?.replace(CommandName.CHAT, '').trim();
    const fullPromt = prompt + `\n\n"${extraText}"`;
    const isConversationNumber = whitelist?.includes(conversationNumber);
    const isUserNumber = whitelist?.includes(userNumber);
    if (isConversationNumber || isUserNumber) {
      const response = await this.chatService.send(fullPromt);
      return { conversationId, type: MessageResponseType.text, text: response };
    }
    return undefined;
  }

  async sendMessage(payload: {
    to: string;
    message: string;
  }): Promise<ResponseMessage> {
    const { message, to } = payload;
    const conversationId = `${to}@s.whatsapp.net`;
    const data = {
      text: `${message}\n\n_Estes es un mensaje de prueba ⚠️_`,
      conversationId,
      type: MessageResponseType.text,
    };
    this.baileysClient.emit('message:send', data);
    return data;
  }
}
