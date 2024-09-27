import WhatsAppSocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from 'baileys';
import { Logger } from '@nestjs/common';
import P from 'pino';

type Options = { authInfoPath: string };

export class BaileysSocket {
  private static _socket: any;

  public static async connect({ authInfoPath }: Options) {
    if (BaileysSocket?._socket) return BaileysSocket?._socket;
    Logger.log('starting...', 'Baileys');
    const { state, saveCreds } = await useMultiFileAuthState(authInfoPath);
    Logger.log('credentials loaded', 'Baileys');

    BaileysSocket._socket = WhatsAppSocket({
      auth: state,
      printQRInTerminal: true,
      syncFullHistory: false,
      version: [2, 3000, 1015901307],
      logger: P({ level: 'error' }) as any,
    });

    BaileysSocket._socket.ev.on('creds.update', saveCreds);

    BaileysSocket._socket.ev.on('connection.update', (data) => {
      const { connection, lastDisconnect } = data;

      if (connection === 'open') Logger.log('connection opened', 'Baileys');

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.error(lastDisconnect?.error);
        console.info('reconnecting:', shouldReconnect);
        if (shouldReconnect) process.exit();
      }
    });
    return BaileysSocket._socket;
  }
}
