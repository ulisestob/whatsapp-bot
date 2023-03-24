import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestMessage } from 'src/domain/types/request-message.type';
import { ResponseMessage } from 'src/domain/types/response-message.type';
import { CommandService } from '../services/command.service';

@Controller()
export class AppController {
  constructor(private readonly commandService: CommandService) {}

  @MessagePattern('message')
  onMessage(
    @Payload('data') payload: RequestMessage,
  ): Promise<ResponseMessage> {
    return this.commandService.handle(payload);
  }
}
