import { Injectable } from '@angular/core';
import { JobStateService } from './job-state.service';

@Injectable({
  providedIn: 'root',
})
export class JobWebSocketService {
  private ws: WebSocket | null = null;

  constructor(private jobStateService: JobStateService) {}

  connect(senderId: string): void {
    if (this.ws) {
      this.ws.close();
    }
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.onopen = () => {
      console.log('Job WebSocket connected');
      this.ws?.send(JSON.stringify({ subscribeSender: senderId }));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.jobStateService.updateJob(data);
      } catch (err) {
        console.error('Error parsing job WebSocket message', err);
      }
    };

    this.ws.onerror = (error) => {
      console.error('Job WebSocket error', error);
    };

    this.ws.onclose = () => {
      console.log('Job WebSocket disconnected');
    };
  }
}
