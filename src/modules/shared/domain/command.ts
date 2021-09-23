export type MessageType = 'text'|'listMessage'|'image'|'video'|'buttonsMessage'

interface Command<T> {
    names: string[]
    messageType: MessageType
    run(): Promise<T>
}

export default Command
