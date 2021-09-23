import Command, { MessageType } from "../../shared/domain/command";

class MenuCommand implements Command<string> {
    public names: string[] = ['!menu', '!commands', '!help']
    public messageType: MessageType = 'text'
    
    async run (): Promise<string> {
        const commands = [
            '*!help*: _muestra el menu de commandos._',
            '*!sticker*: _convierte cualquier imagen, gif, video en sticker._',
            '*!survey*: _genera una encuesta rapida._',
        ]
        return `⌘⌘⌘⌘ *MENU* ⌘⌘⌘⌘\n\n${commands.join(`\n`)}\n\n⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘`
    }

}

export default new MenuCommand()