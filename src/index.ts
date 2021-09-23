import configs from "./modules/shared/infrastructure/configs"
import { Baileys } from "./modules/shared/infrastructure/baileys"
import MenuCommand from "./modules/menu/application/command"

const { auth } = configs

Baileys.start(auth)
    // .attach('!hola')
    // .attach('!help')
    .attachSticker()
    .attachCommand(MenuCommand)