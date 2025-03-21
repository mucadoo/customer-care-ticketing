import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {ApiTicket} from '../models/api-ticket.model';
import {ApiMessage} from '../models/api-message.model';
import {Ticket} from '../models/ticket.model';
import {Message} from '../models/message.model';

@Injectable({
    providedIn: 'root'
})
export class TicketsService {
    private baseUrl = "http://localhost:8000/api/v1";

    constructor(private http: HttpClient) {
    }

    getTickets(status?: "resolved" | "unresolved"): Observable<Ticket[]> {
        return this.http.get<{ data: ApiTicket[] }>(`${this.baseUrl}/tickets`, {params: status ? {status} : {}})
            .pipe(
                map(response =>
                    response.data.map(ticket => ({
                        ...ticket,
                        createdAt: new Date(ticket.createdAt)
                    }) as Ticket)
                )
            );
    }

    getTicket(ticketId: number): Observable<Ticket> {
        return this.http.get<ApiTicket>(`${this.baseUrl}/tickets/${ticketId}`)
            .pipe(
                map(apiTicket => ({
                    ...apiTicket,
                    createdAt: new Date(apiTicket.createdAt)
                }) as Ticket)
            );
    }

    getTicketMessages(ticketId: number): Observable<Message[]> {
        return this.http.get<{ data: ApiMessage[] }>(`${this.baseUrl}/tickets/${ticketId}/messages`)
            .pipe(
                map(response =>
                    response.data.map(message => ({
                        ...message,
                        createdAt: new Date(message.createdAt)
                    }) as Message)
                )
            );
    }

    resolveTicket(ticketId: number): Observable<any> {
        return this.http.put(`${this.baseUrl}/tickets/${ticketId}/resolve`, {});
    }

    addMessageToTicket(ticketId: number, message: Pick<Message, "text" | "senderType" | "senderId">): Observable<Message> {
        return this.http.post<ApiMessage>(`${this.baseUrl}/tickets/${ticketId}/messages`, message)
            .pipe(
                map(apiMessage => ({
                    ...apiMessage,
                    createdAt: new Date(apiMessage.createdAt)
                }) as Message)
            );
    }

    sendBulkReply(payload: {
        ticketIds: number[];
        senderType: 'operator' | 'customer';
        senderId: string;
        text: string;
    }): Observable<{ jobId: string }> {
        return this.http.post<{ jobId: string }>(`${this.baseUrl}/tickets/bulk-reply`, payload);
    }
}
