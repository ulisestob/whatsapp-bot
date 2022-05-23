import { inject, injectable } from "inversify";
import { MessageCommandBus } from "../../shared/domain/interfaces/messageCommandBus.interface";
import { command } from "../../shared/utils/command.decorator";
import { MessageData } from "../../shared/domain/interfaces/types";
import { HelpUsecase } from "../application/useCases/help.useCase";
import { ImageStickerUsecase } from "../application/useCases/imageSticker.useCase";
import { VideoStickerUsecase } from "../application/useCases/videoSticker.useCase";

@injectable()
export class CommandHandler {
    constructor(
        @inject('MessageCommandBus') private messageBus: MessageCommandBus,
        @inject('HelpUsecase') private helpUsecase: HelpUsecase,
        @inject('ImageStickerUsecase') private imageStickerUsecase: ImageStickerUsecase,
        @inject('VideoStickerUsecase') private videoStickerUsecase: VideoStickerUsecase
    ){}

    @command('!help')
    async help(data: MessageData) {
        const result = await this.helpUsecase.execute(data)
        this.messageBus.send(result)
    }

    @command('!sticker')
    async sticker(data: MessageData) {
        let useCase
        switch (data.message.type) {
            case 'image':
                useCase = this.imageStickerUsecase; break
            case 'video':
                useCase = this.videoStickerUsecase; break
            default:
                useCase = this.imageStickerUsecase; break
        }
        const result = await useCase.execute(data)
        this.messageBus.send(<any>result)
    }
}