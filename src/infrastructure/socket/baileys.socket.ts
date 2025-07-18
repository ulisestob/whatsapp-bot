import WhatsAppSocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
} from 'baileys';
import * as QRCode from 'qrcode';
import { Logger } from '@nestjs/common';
import P from 'pino';
import * as NodeCache from 'node-cache';

type Options = { authInfoPath: string };

export class BaileysSocket {
  private static _socket: ReturnType<typeof WhatsAppSocket>;

  public static async connect({ authInfoPath }: Options) {
    if (BaileysSocket?._socket) return BaileysSocket?._socket;
    Logger.log('starting...', 'Baileys');
    const msgRetryCounterCache = new NodeCache();
    const userDevicesCache = new NodeCache();
    const { state, saveCreds } = await useMultiFileAuthState(authInfoPath);
    Logger.log('credentials loaded', 'Baileys');

    BaileysSocket._socket = WhatsAppSocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys),
      },
      syncFullHistory: false,
      shouldSyncHistoryMessage: () => false,
      version: [2, 3000, 1023223821],
      logger: P({ level: 'error' }) as any,
      userDevicesCache,
      msgRetryCounterCache,
    });

    BaileysSocket._socket.ev.on('creds.update', async (data) => {
      const myNumber = data?.me?.id?.split?.('@')?.[0]?.split?.(':')?.[0];
      console.log('-----myNumber', { name: data?.me?.name, number: myNumber });
    });

    BaileysSocket._socket.ev.on('creds.update', saveCreds);

    BaileysSocket._socket.ev.on('connection.update', async (data) => {
      const { connection, lastDisconnect, qr } = data;

      if (connection === 'open') Logger.log('connection opened', 'Baileys');

      if (connection === 'close') {
        const statusCode = (<any>lastDisconnect?.error)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.error(lastDisconnect?.error);
        console.info('reconnecting:', shouldReconnect);
        if (shouldReconnect) process.exit();
      }

      if (qr) {
        const qrOptions = { type: 'terminal', small: true };
        console.log(await QRCode.toString(qr, qrOptions));
      }
    });
    return BaileysSocket._socket;
  }
}
