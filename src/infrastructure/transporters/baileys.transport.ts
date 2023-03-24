import WhatsAppSocket, {
  AuthenticationState,
  DisconnectReason,
} from '@adiwajshing/baileys';
import {
  Server,
  CustomTransportStrategy,
  BaseRpcContext,
} from '@nestjs/microservices';
import { ResponseMessage } from 'src/domain/types/response-message.type';
import { SendMessageMapper } from './baileys.mapper';

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

    socket.ev.on('messages.upsert', async (data) => {
      try {
        // const MY_CONVERSATION = 'xxxxxxxxxxxxxxxxxx@g.us';
        const message = await SendMessageMapper.toDomain(data);
        // if (MY_CONVERSATION === message.conversationId) {
        if (!message?.fromMe) {
          const pattern = 'message';
          const handler = parent.messageHandlers.get(pattern);
          const ctx = new BaseRpcContext(<any>{});
          if (handler) {
            const payload = { pattern, data: message, options: {} };
            const result: ResponseMessage = await handler(payload, ctx);
            result && this.sendMessage(socket, result);
          }
        }
        // }
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
}
