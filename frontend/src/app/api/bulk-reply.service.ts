import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BulkReplyService {
  private baseUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  sendBulkReply(payload: {
    ticketIds: number[];
    senderType: 'operator' | 'customer';
    senderId: string;
    text: string;
  }): Observable<{ jobId: string }> {
    return this.http.post<{ jobId: string }>(
      `${this.baseUrl}/tickets/bulk-reply`,
      payload
    );
  }
}
