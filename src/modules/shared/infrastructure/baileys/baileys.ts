import { WAConnection, MessageType, WAChatUpdate } from '@adiwajshing/baileys'
import Command from '../../domain/command'
import sharp from 'sharp'
import streamifier from 'streamifier'
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import fluent from 'fluent-ffmpeg'
import tmp from 'tmp'
import fs from 'fs'
// const ffprobe = require('@ffprobe-installer/ffprobe')

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
        console.log('attached: !sticker : Image')
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

    public attachStickerVideo () {
        console.log('attached: !sticker : Video')
        this.connection.on('chat-update', async (chat: WAChatUpdate) => {
            if (chat.messages && chat.count) {
                const message = chat.messages.last
                const [ messageType ] = Object.keys(<any>message.message)
                const id: string = <string>message.key.remoteJid
                const { url, caption } = message.message?.videoMessage || {}

                if (messageType == MessageType.video && url && caption == '!sticker') {
                    const videoBuffer = await this.connection.downloadMediaMessage(message)
                    const videoStream = await streamifier.createReadStream(videoBuffer)
                    
                    const tempObject = tmp.fileSync()
                    const tempName = `${tempObject.name}.webp`

                    const ffmpeg = fluent()
                        // .setFfprobePath(ffprobe.path)
                        // .setFfmpegPath(ffmpegInstaller.path)
                    
                    await new Promise((resolve, reject) => {
                        ffmpeg
                            .input(videoStream)
                            .noAudio()
                            .fps(16)
                            .size('250x?')
                            .aspect('1:1')
                            .keepDAR()
                            .duration(6)
                            .videoFilters([`crop=w='min(min(iw\,ih)\,512)':h='min(min(iw\,ih)\,512)'`])
                            .format('webp')
                            .output(tempName)
                            .on('end', () => {
                                console.log("Finished Generate from video")
                                resolve(tempName)
                            })
                            .on('error', (e) => {
                                console.log(e)
                                reject(e)
                            })
                            .run()
                    })

                    const bufferwebp = fs.readFileSync(tempName)

                    await this.send(id, <any>bufferwebp, MessageType.sticker)
                    await fs.unlinkSync(tempName)
                    await tempObject.removeCallback()
                }
            }
        })
        return this
    }

    public attachHeroes () {
        console.log('attached: !heroes')
        this.connection.on('chat-update', async (chat: WAChatUpdate) => {
            if (chat.messages && chat.count) {
                const message = chat.messages.last
                const [ messageType ] = Object.keys(<any>message.message)
                const id: string = <string>message.key.remoteJid
                const text =  message.message?.conversation || {}

                if (messageType == MessageType.text && text == '!heroes') {
                    const rows = [
                        {title: 'Iron Man', description: "Robert Downey Jr.", rowId:"rowid1"},
                        {title: 'Captain America', description: "Chris Evans", rowId:"rowid2"},
                        {title: 'Thor', description: "Chris Hemsworth", rowId:"rowid1"},
                        {title: 'Spiderman', description: "Tom Hollan", rowId:"rowid1"},
                        {title: 'Aquaman', description: "Jason Momoa", rowId:"rowid1"},
                        {title: 'Quicksilver', description: "Evan Peters", rowId:"rowid1"},
                        {title: 'Batman', description: "Ben Affleck", rowId:"rowid1"}
                    ]
                                        
                    const button = {
                        buttonText: 'Opciones',
                        description: "Cual es tu super heroe favorito?",
                        sections: [ {title: "Super Heroes", rows: rows} ],
                        listType: 1
                    }
                    
                    await this.send(id, <any>button, MessageType.listMessage)
                }
            }
        })
        return this
    }

    public attachPlan () {
        console.log('attached: !plan')
        this.connection.on('chat-update', async (chat: WAChatUpdate) => {
            if (chat.messages && chat.count) {
                const message = chat.messages.last
                const [ messageType ] = Object.keys(<any>message.message)
                const id: string = <string>message.key.remoteJid
                const text =  message.message?.conversation || {}

                if (messageType == MessageType.text && text == '!plan') {
                   const buttons = [
                        {buttonId: 'yes', buttonText: {displayText: 'Contrar'}, type: 1},
                        {buttonId: 'no', buttonText: {displayText: 'Cancelar'}, type: 1}
                    ]
                    
                    const buttonMessage = {
                        contentText: "No cuentas con un plan activo, deseas:",
                        buttons: buttons,
                        headerType: 1
                    }
                    await this.send(id, <any>buttonMessage, MessageType.buttonsMessage)
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