import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateMessagingDto } from './dto/create-messaging.dto';
import { UpdateMessagingDto } from './dto/update-messaging.dto';
import { Role } from 'generated/prisma';
import { Messaging } from './entities/messaging.entity';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { MessagingGateway } from './messaging.gateway';

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private messagingGateway: MessagingGateway,
  ) {}
  async create(createMessagingDto: CreateMessagingDto) {
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
    const newMessage = new Messaging({
      content: message.content,
      files: createMessagingDto.files,
      userId: createMessagingDto.userId,
      receiverId: createMessagingDto.receiverId,
      groupChatId: createMessagingDto.groupChatId,
    });

    this.messagingGateway.sendMessageToRoom(newMessage.userId, newMessage.receiverId, newMessage);

    return newMessage;
  }

  async findOne(id: number) {
    return await this.prisma.message.findFirst({
      where: {id},
      include: {
        files: true
      }
    })
  }
  async findMessageBetweenUsers(id_1: number, id_2: number) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          {
            AND: [
              {
                userId: id_1,
              },
              { receiverId: id_2 },
            ],
          },
          {
            AND: [
              {
                userId: id_2,
              },
              { receiverId: id_1 },
            ],
          },
        ],
      },
      include: {
        files: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const responseMessages: Messaging[] = [];
    messages.forEach((message) =>
      responseMessages.push(
        new Messaging({
          content: message.content,
          files: message.files.map((file) => file.url),
          userId: message.userId,
          receiverId: message.receiverId,
          groupChatId: message.groupChatId,
        }),
      ),
    );
    return responseMessages;
  }

  async update(userId:number,id: number, updateMessagingDto: UpdateMessagingDto) {
    const existingMessage = await this.prisma.message.findFirst({
      where: {id}
    })
    if (existingMessage.userId !== userId) throw new UnauthorizedException("You do not have the right to update this message")
    return await this.prisma.message.update({
      where: {id},
      data: {content: updateMessagingDto.content}
    })
  }

  async remove(userId:number,id: number) {
    const existingMessage = await this.prisma.message.findFirst({
      where: {id}
    })
    if (existingMessage.userId !== userId) throw new UnauthorizedException("You do not have the right to remove this message")
    return await this.prisma.message.delete({
      where: {id}
    })
  }
}
