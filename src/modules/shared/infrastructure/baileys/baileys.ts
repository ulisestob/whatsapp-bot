import { injectable } from "inversify";
import { MessageCommandBus } from "../../domain/interfaces/messageCommandBus.interface";
import { MessageData, SendData } from "../../domain/interfaces/types";
import { BaileysConnection, BaileysSocket } from "./baileys.connection";
import { SendMessageMapper } from "./baileys.mapper";

@injectable()
export class BaileysMessageCommandBus implements MessageCommandBus {
    private socket: BaileysSocket

    constructor() {
        this.socket = new BaileysConnection().socket
    }

    attach(pattern: string, callback: (data: MessageData) => void): void {
        console.log('command:', pattern, 'attached!')
        this.socket.ev.on('messages.upsert', async (message) => {
            console.log('MESSAGE', message.messages[0])
            const payload = await SendMessageMapper.toDomain(message)
            const messageText = payload?.message?.text || ''
            const containsPattern = this.testPattern(pattern, messageText)
            if (containsPattern) callback(payload)
        })
    }

    send(body: SendData): void {
        console.log('Sending to:', body.userId)
        const payload = SendMessageMapper.toSocket(body)
        this.socket.sendMessage(body.userId, payload)
    }

    private testPattern(pattern: string, text: string): boolean {
        const validator = new RegExp(`${pattern}\\b`, 'gi')
        return validator.test(text)
    }

}