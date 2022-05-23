import WhatsAppSocket, { AnyMessageContent, ConnectionState, DisconnectReason, MessageUpdateType, useSingleFileAuthState, WAMessage } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'

export type BaileysSocket = ReturnType<typeof WhatsAppSocket>
export type BaileysMessage = { messages: WAMessage[];  type: MessageUpdateType;}

const { state, saveState } = useSingleFileAuthState(`./auth_info_multi_device.json`)

export class BaileysConnection {
    public socket: BaileysSocket
    
    constructor() {
        this.socket = this.getSocket()
        this.setListeners(this.socket.ev)
    }

    private getSocket () {
        return WhatsAppSocket({
            auth: state,
            printQRInTerminal: true,
        })
    }

    private reconnect () {
        console.log('Reconnecting...')
        this.socket = this.getSocket()
        this.setListeners(this.socket.ev)
    }

    private setListeners (socket: any): void {
        const parent = this
        socket
            .on('creds.update', this.onCredentialsUpdated)
            .on('connection.update', this.onConnectionOpen)
            .on('connection.update', (data: any) => this.onConnectionClose(data, parent))
    }

    private onCredentialsUpdated (): void {
        saveState()
    }

    private onConnectionOpen (data: Partial<ConnectionState>): void {
        const { connection } = data
        if (connection === 'open')
            console.log('opened connection')
    }

    private onConnectionClose (data: Partial<ConnectionState>, parent: BaileysConnection): void {
        const { connection, lastDisconnect } = data
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.error(lastDisconnect?.error)
            console.info('reconnecting:', shouldReconnect)
            if (shouldReconnect) parent.reconnect()
        }
    }

    susbscribeOnMessage (callback: (data: BaileysMessage) => void): void {
        this.socket.ev.on('messages.upsert', callback)
    }

    sendMessage (remoteJid: string, content: AnyMessageContent) {
        return this.socket.sendMessage(remoteJid, content)
    }

}
