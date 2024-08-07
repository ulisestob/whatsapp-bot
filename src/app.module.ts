import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { AppController } from './application/controllers/app.controller';
import { ChatService } from './application/services/chat.service';
import { MessageCommandService } from './application/services/message-command.service';
import { FirebaseService } from './application/services/firebase.service';
import { MediaService } from './application/services/media.service';
import { appConfig } from './configs/app.config';
import { firebaseConfig } from './configs/firebase.config';
import { GroupParticipantsCommandService } from './application/services/group-participants-command.service';
import { BaileysClient } from './infrastructure/proxies/baileys.proxy';

@Module({
  controllers: [AppController],
  imports: [ConfigModule.forRoot({ load: [appConfig, firebaseConfig] })],
  providers: [
    MessageCommandService,
    GroupParticipantsCommandService,
    FirebaseService,
    ChatService,
    MediaService,
    {
      provide: BaileysClient,
      inject: [appConfig.KEY],
      useFactory: ({ authInfoPath }: ConfigType<typeof appConfig>) => {
        return new BaileysClient({ authInfoPath });
      },
    },
  ],
})
export class AppModule {}
