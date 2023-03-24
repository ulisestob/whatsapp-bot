import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './application/controllers/app.controller';
import { ChatService } from './application/services/chat.service';
import { CommandService } from './application/services/command.service';
import { FirebaseService } from './application/services/firebase.service';
import { MediaService } from './application/services/media.service';
import { appConfig } from './configs/app.config';
import { firebaseConfig } from './configs/firebase.config';

@Module({
  controllers: [AppController],
  providers: [CommandService, FirebaseService, ChatService, MediaService],
  imports: [ConfigModule.forRoot({ load: [appConfig, firebaseConfig] })],
})
export class AppModule {}
