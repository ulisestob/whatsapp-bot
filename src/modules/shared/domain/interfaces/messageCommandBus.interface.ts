import { MessageData, SendData } from "./types";

type Message = (data: MessageData) => void

export interface MessageCommandBus {
    attach(pattern: string, callback: (data: MessageData) => void): void
    send(body: SendData): void
}
