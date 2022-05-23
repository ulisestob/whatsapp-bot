import { ContainerModule, interfaces } from "inversify";
import { HelpUsecase } from "../application/useCases/help.useCase";
import { ImageStickerUsecase } from "../application/useCases/imageSticker.useCase";
import { VideoStickerUsecase } from "../application/useCases/videoSticker.useCase";
import { CommandHandler } from "./commandHandler";

export const commandsIoC = new ContainerModule((bind: interfaces.Bind) => {
    bind<HelpUsecase>('HelpUsecase').to(HelpUsecase)
    bind<ImageStickerUsecase>('ImageStickerUsecase').to(ImageStickerUsecase)
    bind<VideoStickerUsecase>('VideoStickerUsecase').to(VideoStickerUsecase)
    bind<CommandHandler>('CommandHandler').to(CommandHandler)
})