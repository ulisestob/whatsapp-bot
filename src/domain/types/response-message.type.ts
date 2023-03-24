import { MessageResponseType } from '../enums/message-response-type.enum';

export type ResponseMessage = {
  type: MessageResponseType;
  conversationId: string;
  userId?: string;
  text?: string;
  media?: Buffer;
  mentions?: string[];
};
