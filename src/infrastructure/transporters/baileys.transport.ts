import {
  Server,
  CustomTransportStrategy,
  BaseRpcContext,
  Transport,
} from '@nestjs/microservices';
import { RequestMessage } from 'src/domain/types/request-message.type';
import { ResponseMessage } from 'src/domain/types/response-message.type';
import { SendMessageMapper } from '../mappers/baileys.mapper';
import { Logger } from '@nestjs/common';
import { BaileysSocket } from '../socket/baileys.socket';

type Options = {
  authInfoPath: string;
};

export class BaileysTransport
  extends Server
  implements CustomTransportStrategy
{
  constructor(private options: Options) {
    super();
  }
  transportId?: symbol | Transport;

  async listen() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const parent = this;
    const { authInfoPath } = this.options;
    const socket = await BaileysSocket.connect({ authInfoPath });

    socket?.ev.on('group-participants.update', async (data) => {
      console.log('group-participants.update', data);
      try {
        const message = { ...data, conversationId: data?.id };
        const pattern = 'group-participants';
        const handler = parent.messageHandlers.get(pattern);
        const ctx = new BaseRpcContext(<any>{});
        if (handler) {
          const payload = { pattern, data: message, options: {} };
          const result: ResponseMessage[] = await handler(payload, ctx);
          if (result && result?.length)
            result.forEach((msg) => this.sendMessage(socket, msg));
        }
      } catch (err) {
        console.log(err);
      }
    });

    socket?.ev.on('messages.upsert', async (data) => {
      try {
        // const MY_CONVERSATION = 'xxxxxxxxxxxxxxxxxx@g.us';
        const message = await SendMessageMapper.toDomain(data);
        // if (MY_CONVERSATION === message.conversationId) {
        if (!message?.fromMe) {
          this.logMessage(message);
          const pattern = 'message';
          const handler = parent.messageHandlers.get(pattern);
          const ctx = new BaseRpcContext(<any>{});
          if (handler) {
            const payload = { pattern, data: message, options: {} };
            const result: ResponseMessage = await handler(payload, ctx);
            result && this.sendMessage(socket, result);
          }
          // }
        }
      } catch (err) {
        console.log(err);
      }
    });
  }

  close() {
    Logger.log('connection closed', 'Baileys');
  }

  private sendMessage(socket: any, body: ResponseMessage): void {
    const payload = SendMessageMapper.toSocket(body);
    socket.sendMessage(body.conversationId, payload);
  }

  private logMessage(message: RequestMessage): void {
    const { conversationId, message: msg } = message;
    const { type, text } = msg;
    const raw = JSON.stringify({ conversationId, type, text });
    Logger.log(raw);
  }
}
