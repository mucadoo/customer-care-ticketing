import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {ApiTicket} from '../models/api-ticket.model';
import {ApiMessage} from '../models/api-message.model';
import {Ticket} from '../models/ticket.model';
import {Message} from '../models/message.model';

interface ApiResponse<T> {
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class TicketsService {
    private baseUrl = "http://localhost:8000/api/v1";

    constructor(private http: HttpClient) {
    }

    private transformDate<T extends { createdAt: string }>(
        item: T
    ): Omit<T, 'createdAt'> & { createdAt: Date } {
        return {...item, createdAt: new Date(item.createdAt)};
    }


    getTickets(status?: "resolved" | "unresolved"): Observable<Ticket[]> {
        return this.http.get<ApiResponse<ApiTicket[]>>(`${this.baseUrl}/tickets`, {params: status ? {status} : {}}).pipe(
            map(response =>
                response.data.map(ticket => ({
                    ...this.transformDate(ticket)
                } as Ticket))
            )
        );
    }

    getTicket(ticketId: number): Observable<Ticket> {
        return this.http.get<ApiTicket>(`${this.baseUrl}/tickets/${ticketId}`).pipe(
            map(apiTicket => ({
                ...this.transformDate(apiTicket)
            } as Ticket))
        );
    }

    getTicketMessages(ticketId: number): Observable<Message[]> {
        return this.http.get<ApiResponse<ApiMessage[]>>(`${this.baseUrl}/tickets/${ticketId}/messages`).pipe(
            map(response =>
                response.data.map(message => this.transformDate(message)) as Message[]
            )
        );
    }

    resolveTicket(ticketId: number): Observable<any> {
        return this.http.put(`${this.baseUrl}/tickets/${ticketId}/resolve`, {});
    }

    addMessageToTicket(ticketId: number, message: Pick<Message, "text" | "senderType" | "senderId">): Observable<Message> {
        return this.http.post<ApiMessage>(`${this.baseUrl}/tickets/${ticketId}/messages`, message).pipe(
            map(response => this.transformDate(response) as Message)
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
