import { Container } from 'inversify'
import { commandsIoC } from '../../commands/infrastructure/comands.ioc';
import { MessageCommandBus } from '../domain/interfaces/messageCommandBus.interface';
import { BaileysMessageCommandBus } from './baileys/baileys';

const globalIoC = new Container();
globalIoC.bind<MessageCommandBus>('MessageCommandBus').toConstantValue(new BaileysMessageCommandBus());
globalIoC.load(commandsIoC)

export { globalIoC }