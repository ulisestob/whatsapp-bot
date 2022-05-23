import "reflect-metadata"
import './modules/shared/infrastructure/configs'
import { CommandHandler } from "./modules/commands/infrastructure/commandHandler";
import { globalIoC } from "./modules/shared/infrastructure/global.ioc";
import { ModuleLoader } from "./modules/shared/utils/module.loader";

ModuleLoader
    .setup({
        globalDependencies: globalIoC,
        commandModules: [CommandHandler],
    }).start()