import { WAConnection, MessageType, WAChatUpdate } from '@adiwajshing/baileys'
import Command from '../../domain/command'
import sharp from 'sharp'

class Baileys {
    private connection: WAConnection
    
    private constructor(authInfo: any) {
        this.connection = new WAConnection()
        this.connection.loadAuthInfo(authInfo)
        this.connection.connect()
        this.attachEvents()
        return this
    }

    static start (authInfo: any) {
        return new Baileys(authInfo)
    }

    private attachEvents () {
        this.connection.on('open', () => console.log('Connection Opened!'))
        return this
    }

    private async send (id: string, message: string, messageType: MessageType) {
        await this.connection.sendMessage(id, message, messageType)
        return this
    }

    public attach (name: string, text = 'HW') {
        console.log('attached:', name)
        this.connection.on('chat-update', async (chat: WAChatUpdate) => {
            if (chat.messages && chat.count) {
                const message = chat.messages.last
                const [ messageType ] = Object.keys(<any>message.message)
                const id: string = <string>message.key.remoteJid
                
                if (messageType === MessageType.text) {
                    if (message.message?.conversation === name) {
                        this.send(id, text, MessageType.text)
                    }
                }
            }
        })
        return this
    }

    public attachSticker () {
        console.log('attached: !sticker')
        this.connection.on('chat-update', async (chat: WAChatUpdate) => {
            if (chat.messages && chat.count) {
                const message = chat.messages.last
                const [ messageType ] = Object.keys(<any>message.message)
                const id: string = <string>message.key.remoteJid
                const { url, caption } =  message.message?.imageMessage || {}

                if (messageType == MessageType.image && url && caption == '!sticker') {
                    const imageBuffer = await this.connection.downloadMediaMessage(message)
                    const sticker = await sharp(imageBuffer)
                        .resize(300, 300, {
                            fit: 'contain',
                            background: { r: 255, g: 255, b: 255, alpha: 0 }
                        }).webp({ lossless: true }).toBuffer()

                    await this.send(id, <any>sticker, MessageType.sticker)
                }
            }
        })
        return this
    }

    public async attachCommand (command: Command<string>) {
        const text = await command.run()
        command.names.map((item: string) => this.attach(item, text))
        return this
    }

}

export default Baileys