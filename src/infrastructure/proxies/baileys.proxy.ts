import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { BaileysSocket } from '../socket/baileys.socket';
import { SendMessageMapper } from '../mappers/baileys.mapper';
import { ResponseMessage } from 'src/domain/types/response-message.type';

type Options = {
  authInfoPath: string;
};

export class BaileysClient extends ClientProxy {
  private _socket: any;

  constructor(private options: Options) {
    super();
  }

  async connect(): Promise<any> {
    const { authInfoPath } = this.options;
    this._socket = await BaileysSocket.connect({ authInfoPath });
  }

  async close() {
    console.log('close');
  }

  async dispatchEvent(packet: ReadPacket<any>): Promise<any> {
    switch (packet?.pattern) {
      case 'message:send': {
        console.log('event', packet?.pattern);
        return this.sendMessage(packet?.data);
      }
      case 'message:template': {
        return 'template';
      }
      default: {
        console.log('event not found: ', packet);
        return null;
      }
    }
  }

  publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ): () => void {
    console.log('message:', packet);
    setTimeout(() => callback({ response: packet.data }), 5000);
    return () => console.log('teardown');
  }

  private sendMessage(body: ResponseMessage): void {
    const payload = SendMessageMapper.toSocket(body);
    return this._socket.sendMessage(body.conversationId, payload);
  }
}
