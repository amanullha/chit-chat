import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8080)
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  // This method runs when the gateway is initialized
  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  // This method runs when a client connects to the WebSocket server
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // This method runs when a client disconnects from the WebSocket server
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Handle events in a specific namespace (e.g., /chat)
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('Received message:', data);

    // Broadcast the message to all clients in the same namespace
    client.broadcast.emit('message', data);
  }

  // Create a custom namespace (e.g., /room1) and handle events within it
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomName: string, @ConnectedSocket() client: Socket) {
    client.join(roomName);
    console.log(`Client ${client.id} joined room: ${roomName}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() roomName: string, @ConnectedSocket() client: Socket) {
    client.leave(roomName);
    console.log(`Client ${client.id} left room: ${roomName}`);
  }

  @SubscribeMessage('roomMessage')
  handleRoomMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const roomName = data.room;
    console.log(`Received message in room ${roomName}:`, data);

    // Broadcast the message to all clients in the specified room
    this.server.to(roomName).emit('roomMessage', data);
  }
}   