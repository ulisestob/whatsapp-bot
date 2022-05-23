import { injectable } from "inversify";
import { MessageData, SendData } from "../../../shared/domain/interfaces/types";

@injectable()
export class HelpUsecase {
    async execute (data: MessageData): Promise<SendData> {
        const { userId } = data
        const commands = [
            '*!help*: _muestra el menu de commandos._',
            '*!sticker*: _convierte cualquier imagen, gif, video en sticker._',
            // '*!heroes*: _muestra una demo de formulario._',
            // '*!plan*: _demo de botones._',
        ].join(`\n`)
        const text = `⌘⌘⌘⌘⌘ *MENU* ⌘⌘⌘⌘⌘\n\n${commands}\n\n⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘`
        return { type: 'text', userId, text }
    }
}