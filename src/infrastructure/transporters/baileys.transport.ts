import WhatsAppSocket, {
  AuthenticationState,
  DisconnectReason,
} from '@adiwajshing/baileys';
import {
  Server,
  CustomTransportStrategy,
  BaseRpcContext,
} from '@nestjs/microservices';
import { RequestMessage } from 'src/domain/types/request-message.type';
import { ResponseMessage } from 'src/domain/types/response-message.type';
import { SendMessageMapper } from './baileys.mapper';
import { Logger } from '@nestjs/common';

type Options = {
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
};

export class BaileysTransport
  extends Server
  implements CustomTransportStrategy
{
  constructor(private options: Options) {
    super();
  }

  listen() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const parent = this;
    console.log('baileys started');

    const socket = WhatsAppSocket({
      auth: this.options.state,
      printQRInTerminal: true,
      syncFullHistory: false,
    });

    socket.ev.on('creds.update', this.options.saveCreds);

    socket.ev.on('connection.update', (data) => {
      const { connection, lastDisconnect } = data;

      if (connection === 'open') console.log('opened connection');

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.error(lastDisconnect?.error);
        console.info('reconnecting:', shouldReconnect);
        if (shouldReconnect) process.exit();
      }
    });

    socket.ev.on('group-participants.update', async (data) => {
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

    socket.ev.on('messages.upsert', async (data) => {
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
    console.log('baileys closed');
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
