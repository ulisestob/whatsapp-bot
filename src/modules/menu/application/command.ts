import Command, { MessageType } from "../../shared/domain/command";

class MenuCommand implements Command<string> {
    public names: string[] = ['!menu', '!commands', '!help']
    public messageType: MessageType = 'text'
    
    async run (): Promise<string> {
        const commands = [
            '*!help*: _muestra el menu de commandos._',
            '*!sticker*: _convierte cualquier imagen, gif, video en sticker._',
            '*!heroes*: _muestra una demo de formulario._',
            '*!plan*: _demo de botones._',
        ]
        const footer = '\n\n🕑 *Horario:* _7:00AM - 10:00PM_\n\n'
        return `⌘⌘⌘⌘⌘ *MENU* ⌘⌘⌘⌘⌘\n\n${commands.join(`\n`)}\n\n${footer}⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘`
    }

}

export default new MenuCommand()