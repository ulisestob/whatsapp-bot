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

    @command('!h-e-lp')
    async help(data: MessageData) {
        const result = await this.helpUsecase.execute(data)
        this.messageBus.send(result)
    }

    @command('!sticker|sticker')
    async imageSticker(data: MessageData) {
        if (data.message.type !== 'image') return
        const result = await this.imageStickerUsecase.execute(data)
        this.messageBus.send(result)
    }
    
    @command('!sticker|sticker')
    async videoSticker(data: MessageData) {
        if (data.message.type !== 'video') return
        const result = await this.videoStickerUsecase.execute(data)
        this.messageBus.send(result)
    }
}