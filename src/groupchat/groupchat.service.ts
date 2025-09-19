import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupchatDto } from './dto/create-groupchat.dto';
import { UpdateGroupchatDto } from './dto/update-groupchat.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GroupchatService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createGroupchatDto: CreateGroupchatDto) {
    return await this.prisma.groupChat.create({
      data: createGroupchatDto,
    });
  }

  async findAll(page: number, take: number) {
    const skip = take * (page - 1);
    const total = await this.prisma.groupChat.count();
    const groups = await this.prisma.groupChat.findMany({
      take,
      skip,
      include: {
        users: true,
        messages: false,
        owner: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return {
      currentPage: page,
      total,
      totalPages: groups.length > 0 ? Math.ceil(total / take) : 1,
      groupChats: groups,
    };
  }

  async findOne(id: number) {
    const group = await this.prisma.groupChat.findUnique({
      where: { id },
      include: {
        users: true,
        messages: true,
      },
    });
    if (!group) throw new NotFoundException('group with id' + id + ' not found');
    return group;
  }

  async update(id: number, updateGroupchatDto: UpdateGroupchatDto) {
    const updatedGroup = await this.prisma.groupChat.update({
      where: { id },
      data: updateGroupchatDto,
      include: {
        users: false,
        messages: false,
      },
    });
    return updatedGroup;
  }

  remove(id: number) {
    return `This action removes a #${id} groupchat`;
  }
}
