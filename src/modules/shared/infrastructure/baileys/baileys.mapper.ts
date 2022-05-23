import { AnyMessageContent, DownloadableMessage, downloadContentFromMessage, proto } from "@adiwajshing/baileys";
import { MessageBody, MessageData, MessageType, SendData } from "../../domain/interfaces/types";
import { BaileysMessage } from "./baileys.connection";

type Nullable = undefined | null

export class SendMessageMapper {
    static async toDomain(data: BaileysMessage): Promise<MessageData> {
        const { messages: [message] } = data
        return {
            id: message?.key?.id || '',
            userId: message?.key?.remoteJid || '',
            userName: message?.pushName || 'user',
            message: await Message.create(message)
        }
    }

    static toSocket(data: SendData): AnyMessageContent {
        switch(data.type) {
            case 'text': return { text: data.text || '' }
            case 'sticker': return { sticker: data.media || Buffer.from([])}
        }
    }
}


class Message implements MessageBody {
    type: MessageType;
    text: string | undefined;
    media: Buffer | undefined;
    private message: proto.IMessage | Nullable

    private constructor (data: proto.IWebMessageInfo) {
        this.type = this.getType(data.message)
        this.text = this.getText(data.message)
        this.message = data.message
    }

    static async create (data: proto.IWebMessageInfo): Promise<Message> {
        const message = new Message(data)
        await message.downloadMedia()
        return message
    }

    private getType (message: proto.IMessage | Nullable): MessageType {
        const [ type ] = Object.keys(message || {})
        switch (type) {
            case 'conversation': return 'text'
            case 'videoMessage': return 'video'
            case 'imageMessage': return 'image'
            default: return 'unkown'
        }
    }

    private getText (message: proto.IMessage | Nullable): string | undefined {
        switch (this.type) {
            case 'text': return message?.conversation || ''
            case 'video': return message?.videoMessage?.caption || ''
            case 'image': return message?.imageMessage?.caption || ''
            default: return undefined
        }
    }
    
    private async downloadMedia (): Promise<void> {
        try {
            const validTypes = ['video', 'image']
            if (!validTypes.includes(this.type)) return
            const typeMessage = this.type == 'video' ? 'videoMessage' : 'imageMessage'
            const message = <DownloadableMessage>this.message?.[typeMessage]
            const stream = await downloadContentFromMessage(message, <any>this.type)
            this.media = Buffer.from([])
            for await(const chunk of stream)
                this.media = Buffer.concat([this.media, chunk])
        } catch(err: unknown) {
            this.media = undefined
        }
    }
    
}