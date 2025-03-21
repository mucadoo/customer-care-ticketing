import { Component, Input, OnInit } from '@angular/core';
import { TicketsService } from '../api/tickets.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ticket } from '../models/ticket.model';
import { Message } from '../models/message.model';
import { Observable, of } from 'rxjs';
import { shareReplay, tap, catchError } from 'rxjs/operators';
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
    private ticketService: TicketsService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.messageForm = this.fb.group({
      text: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  private loadTicket(): void {
    this.ticket$ = this.ticketService.getTicket(this._ticketId).pipe(
      tap(ticket => {
        ticket.status === 'resolved' ? this.messageForm.disable() : this.messageForm.enable();
      }),
      shareReplay(1)
    );
  }

  private loadMessages(): void {
    this.messages$ = this.ticketService.getTicketMessages(this._ticketId).pipe(
      catchError(err => {
        this.router.navigate(['home', 'tickets', 'not-found']);
        return of([]);
      })
    );
  }

  closeTicket(): void {
    this.ticketService.resolveTicket(this._ticketId).subscribe(() => {
      this.loadTicket();
    });
  }

  sendMessage(): void {
    const { text } = this.messageForm.value;
    const senderType = "operator";
    const senderId = localStorage.getItem('senderId')!;
    this.ticketService.addMessageToTicket(this._ticketId, { text, senderType, senderId }).subscribe(() => {
      this.loadTicket();
      this.loadMessages();
    });
  }
}
