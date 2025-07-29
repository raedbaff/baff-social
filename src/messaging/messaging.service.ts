import { Injectable } from '@nestjs/common';
import { CreateMessagingDto } from './dto/create-messaging.dto';
import { UpdateMessagingDto } from './dto/update-messaging.dto';
import { Role } from 'generated/prisma';
import { Messaging } from './entities/messaging.entity';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}
  async create(user: { id: number; email: string; role: Role }, createMessagingDto: CreateMessagingDto) {
    const message = await this.prisma.message.create({
      data: {
        content: createMessagingDto.content,
        userId: createMessagingDto.userId,
        receiverId: createMessagingDto.receiverId,
        groupChatId: createMessagingDto.groupChatId ? createMessagingDto.groupChatId : undefined,
      },
    });
    if (createMessagingDto.files && createMessagingDto.files.length > 0) {
      await this.prisma.$transaction(
        createMessagingDto.files.map((file) =>
          this.prisma.messageFile.create({
            data: {
              url: file,
              userId: createMessagingDto.userId,
              messageId: message.id,
            },
          }),
        ),
      );
    }
    return new Messaging({
      content: message.content,
      files: createMessagingDto.files,
      userId: createMessagingDto.userId,
      receiverId: createMessagingDto.receiverId,
      groupChatId: createMessagingDto.groupChatId,
    });
  }

  findAll() {
    return `This action returns all messaging`;
  }

  findOne(id: number) {
    return `This action returns a #${id} messaging`;
  }

  update(id: number, updateMessagingDto: UpdateMessagingDto) {
    return `This action updates a #${id} messaging`;
  }

  remove(id: number) {
    return `This action removes a #${id} messaging`;
  }
}
