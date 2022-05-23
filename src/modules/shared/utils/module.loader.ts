import { Container } from "inversify"
import { MessageCommandBus } from "../domain/interfaces/messageCommandBus.interface"
import { Command } from "./command.decorator"

type Options = { commandModules: any[], messageCommandBus?: MessageCommandBus, globalDependencies: Container }

export class ModuleLoader {
  private constructor (private options: Options) {}

  static setup (options: Options): ModuleLoader {
    return new ModuleLoader(options)
  }

  start () {
    const messageCommandBus: any = this.options.globalDependencies.get('MessageCommandBus')
    this.options.commandModules.forEach((module) => {
      const dependency: any = this.options.globalDependencies.get(module.name)
      const prototypes = module.prototype
      const commands: Command[] = prototypes['commands']
      commands.forEach(async (command) => {
        const { pattern, fnName } = command
        messageCommandBus.attach(pattern, dependency[fnName].bind(dependency))
      })
    })
  }
}