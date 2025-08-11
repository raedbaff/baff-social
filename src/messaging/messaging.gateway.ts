import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('connected with client id', client.id);
  }
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() { userA, userB }: { userA: number; userB: number }, @ConnectedSocket() client: Socket) {
    const roomId = this.getRoomId(userA, userB);
    client.join(roomId);
    return { roomId };
  }
  sendMessageToRoom(userA: number, userB: number, message: any) {
    const room = this.getRoomId(userA, userB);
    this.server.to(room).emit('newMessage', message);
  }

  private getRoomId(userA: number, userB: number) {
    return [userA, userB].sort().join('_');
  }
}
