import {
  AnyMessageContent,
  DownloadableMessage,
  downloadContentFromMessage,
  proto,
  WAMessage,
} from 'baileys';

import {
  MessageBody,
  RequestMessage,
} from 'src/domain/types/request-message.type';
import { MessageType } from 'src/domain/enums/message-type.enum';
import { ResponseMessage } from 'src/domain/types/response-message.type';

type Nullable = undefined | null;
export type BaileysMessage = { messages: WAMessage[]; type: any };

export class SendMessageMapper {
  static async toDomain(data: BaileysMessage): Promise<RequestMessage> {
    const { messages } = data;
    const [message] = messages;
    return {
      id: message?.key?.id || '',
      conversationId: message?.key?.remoteJid || '',
      userId: message?.key?.participant || '',
      fromMe: message?.key?.fromMe || false,
      userName: message?.pushName || 'user',
      message: await Message.create(message),
    };
  }

  static toSocket(data: ResponseMessage): AnyMessageContent {
    switch (data.type) {
      case 'text':
        return { text: data.text || '', mentions: data?.mentions };
      case 'sticker':
        return { sticker: data.media || Buffer.from([]) };
    }
  }
}

class Message implements MessageBody {
  type: MessageType;
  text: string | undefined;
  media: Buffer | undefined;
  mentions: string[] = [];
  private message: proto.IMessage | Nullable;
  private isReply = false;

  private constructor(data: proto.IWebMessageInfo) {
    this.type = this.getType(data.message);
    this.text = this.getText(data.message);
    this.mentions = this.getMentions(data.message);
    this.message = data.message;
  }

  static async create(data: proto.IWebMessageInfo): Promise<Message> {
    const message = new Message(data);
    await message.downloadMedia();
    return message;
  }

  private getType(message: proto.IMessage | Nullable): MessageType {
    const [type] = Object.keys(message || {});
    switch (type) {
      case 'conversation':
        return MessageType.text;
      case 'videoMessage':
        return MessageType.video;
      case 'imageMessage':
        return MessageType.image;
      case 'extendedTextMessage': {
        this.isReply = true;
        return this.getReplyType(message);
      }
      default:
        return MessageType.unkown;
    }
  }

  private getReplyType(message: proto.IMessage | Nullable): MessageType {
    const [type] = Object.keys(
      message?.extendedTextMessage?.contextInfo?.quotedMessage || {},
    );
    switch (type) {
      case 'conversation':
        return MessageType.text;
      case 'videoMessage':
        return MessageType.video;
      case 'imageMessage':
        return MessageType.image;
      case 'stickerMessage':
        return MessageType.sticker;
      case 'audioMessage':
        return MessageType.audio;
      default:
        return MessageType.unkown;
    }
  }

  private getText(message: proto.IMessage | Nullable): string | undefined {
    if (this.isReply) return message?.extendedTextMessage?.text || '';
    switch (this.type) {
      case 'text':
        return message?.conversation || '';
      case 'video':
        return message?.videoMessage?.caption || '';
      case 'image':
        return message?.imageMessage?.caption || '';
      default:
        return undefined;
    }
  }

  private getMentions(message: proto.IMessage | Nullable): string[] {
    if (this.isReply)
      return message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    return [];
  }

  private async downloadMedia(): Promise<void> {
    try {
      // validate type
      const validTypes = ['video', 'image', 'audio', 'sticker'];
      if (!validTypes.includes(this.type)) return;

      const typeMap: Record<string, string> = {
        [MessageType.video]: 'videoMessage',
        [MessageType.audio]: 'audioMessage',
        [MessageType.image]: 'imageMessage',
        [MessageType.sticker]: 'stickerMessage',
      };
      const type = typeMap[this.type] || 'imageMessage';
      // set media message origin
      let message = <DownloadableMessage>this.message?.[type];
      if (this.isReply) {
        message = <DownloadableMessage>(
          this.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[type]
        );
      }
      // get media stream
      const stream = await downloadContentFromMessage(message, <any>this.type);
      this.media = Buffer.from([]);
      for await (const chunk of stream)
        this.media = Buffer.concat([this.media, chunk]);
    } catch (err: unknown) {
      this.media = undefined;
    }
  }
}
