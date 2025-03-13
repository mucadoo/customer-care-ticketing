import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {map, Observable} from 'rxjs';
import {ApiTicket} from "../models/api-ticket.model";
import {ApiMessage} from "../models/message.model";
import {Message} from "../models/api-message.model";

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private baseUrl = "http://localhost:8000/api/v1"

  constructor(
    private http: HttpClient,
  ) { }

  getTickets(status?: "resolved" | "unresolved") {
    type Body = {
      data: ApiTicket[];
    }
    return this.http.get<Body>(`${this.baseUrl}/tickets`, { params: status ? { status } : {} }).pipe(
      map(r => r.data),
      map(x => x.map(({ createdAt, ...other }) => ({
        ...other,
        createdAt: new Date(createdAt),
      }))),
    );
  }

  getTicket(ticketId: number) {
    return this.http.get<ApiTicket>(`${this.baseUrl}/tickets/${ticketId}`).pipe(
      map(({ createdAt, ...other }) => ({
        ...other,
        createdAt: new Date(createdAt),
      }))
    )
  }

  getTicketMessages(ticketId: number) {
    type Body = {
      data: ApiMessage[];
    }
    return this.http.get<Body>(`${this.baseUrl}/tickets/${ticketId}/messages`).pipe(
      map(r => r.data),
      map(x => x.map(({ createdAt, ...other }) => ({
        ...other,
        createdAt: new Date(createdAt),
      }))),
    )
  }

  resolveTicket(ticketId: number) {
    return this.http.put(`${this.baseUrl}/tickets/${ticketId}/resolve`, {})
  }

  addMessageToTicket(ticketId: number, message: Pick<Message, "text" | "senderType" | "senderId">) {
    return this.http.post<ApiMessage>(`${this.baseUrl}/tickets/${ticketId}/messages`, message).pipe(
      map(({ createdAt, ...other }) => ({
        ...other,
        createdAt: new Date(createdAt),
      })),
    );
  }

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
