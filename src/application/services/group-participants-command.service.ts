import { Injectable } from '@nestjs/common';
import { MessageResponseType } from 'src/domain/enums/message-response-type.enum';
import { RequestGroupParticipantsUpdate } from 'src/domain/types/request-group-participants-update.type';
import { ResponseMessage } from 'src/domain/types/response-message.type';
import { FirebaseService } from './firebase.service';
import * as random from 'random-number';

@Injectable()
export class GroupParticipantsCommandService {
  constructor(private firebaseService: FirebaseService) {}

  async handle(payload: RequestGroupParticipantsUpdate): Promise<any> {
    if (payload.action === 'add') {
      return this.welcomeMessage(payload);
    }
    return undefined;
  }

  private async welcomeMessage(
    payload: RequestGroupParticipantsUpdate,
  ): Promise<ResponseMessage[]> {
    const { conversationId, participants } = payload;
    const welcomeMessages = await this.firebaseService.getWelcomeMessages();
    const people = participants?.map((id) => {
      return { number: '@' + id?.split('@')[0], id };
    });
    return people.map((item) => {
      const max = welcomeMessages.length - 1;
      const index = random({ max, min: 0, integer: true });
      const header = welcomeMessages[index].replace('{NAME}', item?.number);
      const rule = `Manda tu nombre, edad, pais y una foto de ti`;
      const footer = `Cumple o te sacamos 🙂`;
      const text = `${header}\n\n${rule}\n\n${footer}`;
      const type = MessageResponseType.text;
      return { type, text, conversationId, mentions: [item?.id] };
    });
  }
}
