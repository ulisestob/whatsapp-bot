import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as streamifier from 'streamifier';
import * as fluent from 'fluent-ffmpeg';
import * as tmp from 'tmp';
import * as fs from 'fs';

@Injectable()
export class MediaService {
  async image(media: Buffer): Promise<Buffer> {
    return sharp(media)
      .resize(300, 300, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .webp({ lossless: true })
      .toBuffer();
  }

  async video(media: Buffer): Promise<Buffer> {
    const videoStream = streamifier.createReadStream(media);
    const tempObject = tmp.fileSync();
    const tempName = `${tempObject.name}.webp`;
    const ffmpeg = fluent();
    await new Promise((resolve, reject) => {
      ffmpeg
        .input(videoStream)
        .noAudio()
        .fps(16)
        .size('250x?')
        .aspect('1:1')
        .keepDAR()
        .duration(6)
        .videoFilters([
          `crop=w='min(min(iw\,ih)\,512)':h='min(min(iw\,ih)\,512)'`,
        ])
        .format('webp')
        .output(tempName)
        .on('end', () => resolve(tempName))
        .on('error', (e) => reject(e))
        .run();
    });
    const buffer = fs.readFileSync(tempName);
    fs.unlinkSync(tempName);
    tempObject.removeCallback();
    return buffer;
  }
}
