import { injectable } from "inversify";
import { MessageCommandBus } from "../../domain/interfaces/messageCommandBus.interface";
import { MessageData, SendData } from "../../domain/interfaces/types";
import { BaileysConnection, BaileysSocket } from "./baileys.connection";
import { SendMessageMapper } from "./baileys.mapper";
@injectable()
export class BaileysMessageCommandBus implements MessageCommandBus {
    private socket: BaileysSocket

    constructor() {
        console.log('loading:', 'BaileysMessageCommandBus')
        this.socket = new BaileysConnection().socket
    }

    attach(pattern: string, callback: (data: MessageData) => void): void {
        console.log('command:', pattern, 'attached!')
        this.socket.ev.on('messages.upsert', async (message) => {
            const payload = await SendMessageMapper.toDomain(message)
            if (pattern == payload?.message?.text) callback(payload)
        })
    }
    send(body: SendData): void {
        console.log(body)
        const payload = SendMessageMapper.toSocket(body)
        this.socket.sendMessage(body.userId, payload)
    }

}