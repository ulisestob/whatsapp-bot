export type MessageType = 'text'|'listMessage'|'image'|'video'|'buttonsMessage'|'unkown'
export type ResponseType = 'text'|'sticker'

export type MessageData = {
    id: string
    userId: string
    userName: string
    message: MessageBody
}

export type MessageBody = {
    type: MessageType
    text?: string
    media?: Buffer
}

export type SendData = {
    userId: string
    type: ResponseType
    text?: string
    media?: Buffer
}
