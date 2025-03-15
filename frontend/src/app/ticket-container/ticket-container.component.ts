import { Component, Input, OnInit } from '@angular/core';
import { TicketsService } from '../api/tickets.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ticket } from '../models/ticket.model';
import { Message } from '../models/api-message.model';
import { Observable, of } from 'rxjs';
import { shareReplay, tap, map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket-container',
  templateUrl: './ticket-container.component.html',
  styleUrls: ['./ticket-container.component.scss']
})
export class TicketContainerComponent implements OnInit {
  private _ticketId = 0;
  ticket$!: Observable<Ticket>;
  messages$!: Observable<Message[]>;
  messageForm: FormGroup;

  @Input()
  set ticketId(ticketId: number) {
    this._ticketId = ticketId;
    this.loadTicket();
    this.loadMessages();
    this.messageForm.reset();
  }
  get ticketId(): number {
    return this._ticketId;
  }

  constructor(
    private api: TicketsService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.messageForm = this.fb.group({
      text: ['', Validators.required],
    });
  }

  ngOnInit(): void { }

  private loadTicket() {
    this.ticket$ = this.api.getTicket(this._ticketId).pipe(
      // Map the ticket if needed (e.g., adding default fields)
      map(ticket => ({
        ...ticket,
        selected: false,
      }) as Ticket),
      tap(ticket => {
        // Enable or disable the message form based on ticket status
        if (ticket.status === 'resolved') {
          this.messageForm.disable();
        } else {
          this.messageForm.enable();
        }
      }),
      shareReplay(1) // Cache the response to avoid multiple API calls
    );
  }

  private loadMessages() {
    this.messages$ = this.api.getTicketMessages(this._ticketId).pipe(
      catchError(err => {
        // Navigate to not-found if error occurs
        this.router.navigate(["home", "tickets", "not-found"]);
        return of([]);
      })
    );
  }

  closeTicket() {
    this.api.resolveTicket(this._ticketId).subscribe(() => {
      // Reload ticket data to reflect the new status
      this.loadTicket();
    });
  }

  sendMessage() {
    const { text } = this.messageForm.value;
    const senderType = "operator";
    const senderId = "operator1";
    this.api.addMessageToTicket(this._ticketId, { text, senderType, senderId }).subscribe(() => {
      // Reload ticket and messages after sending a message
      this.loadTicket();
      this.loadMessages();
    });
  }
}
