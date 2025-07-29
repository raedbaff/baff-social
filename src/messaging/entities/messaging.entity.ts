export class Messaging {
  content: string;
  files?: string[];
  userId: number;
  receiverId: number;
  groupChatId?: number;

  constructor(partial: Partial<Messaging>) {
    Object.assign(this, partial);
  }
}
