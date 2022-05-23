import { MessageData, SendData } from '../../../shared/domain/interfaces/types'
import streamifier from 'streamifier'
import fluent from 'fluent-ffmpeg'
import tmp from 'tmp'
import fs from 'fs'
import { injectable } from 'inversify'

@injectable()
export class VideoStickerUsecase {
    async execute (data: MessageData): Promise<SendData> {
        const { userId, message: { media }} = data

        if (!media) throw new Error('No Media')

        const videoStream = streamifier.createReadStream(media)
        const tempObject = tmp.fileSync()
        const tempName = `${tempObject.name}.webp`
        console.log('fluent', fluent)
        const ffmpeg = fluent()
        console.log('ffmpeg', ffmpeg)
        
        await new Promise((resolve, reject) => {
            console.log('IN:ffmpeg', ffmpeg)
            ffmpeg
                .input(videoStream)
                .noAudio()
                .fps(16)
                .size('250x?')
                .aspect('1:1')
                .keepDAR()
                .duration(6)
                .videoFilters([`crop=w='min(min(iw\,ih)\,512)':h='min(min(iw\,ih)\,512)'`])
                .format('webp')
                .output(tempName)
                .on('end', () => {
                    console.log("Finished Generate from video")
                    resolve(tempName)
                })
                .on('error', (e) => {
                    console.log(e)
                    reject(e)
                })
                .run()
        })

        const sticker = fs.readFileSync(tempName)
        fs.unlinkSync(tempName)
        tempObject.removeCallback()
        return { type: 'sticker', userId, media: sticker }
    }
}