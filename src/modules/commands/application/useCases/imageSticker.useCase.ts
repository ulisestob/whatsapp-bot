import { injectable } from "inversify";
import sharp from "sharp";
import { MessageData, SendData } from "../../../shared/domain/interfaces/types";

@injectable()
export class ImageStickerUsecase {
    async execute (data: MessageData): Promise<SendData> {
        const { userId, message: { media }} = data
        const sticker = await sharp(media)
            .resize(300, 300, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .webp({ lossless: true })
            .toBuffer()
        return { type: 'sticker', userId, media: sticker }
    }
}