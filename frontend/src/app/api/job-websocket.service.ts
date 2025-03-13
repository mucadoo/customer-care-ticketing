import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { JobStateService, JobNotification } from './job-state.service';

@Injectable({
  providedIn: 'root',
})
export class JobWebSocketService {
  private socket!: Socket;

  constructor(private jobStateService: JobStateService) {}

  connect(sellerId: string): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:8080');

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.socket.emit('subscribeSeller', sellerId);
    });

    this.socket.on('jobUpdate', (data: JobNotification) => {
      this.jobStateService.updateJob(data);
    });

    this.socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });
  }

}
