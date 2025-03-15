import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Ticket } from '../models/ticket.model';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent {
  @Input() ticket!: Ticket;
  @Output() resolve = new EventEmitter<void>();

  onResolve(): void {
    this.resolve.emit();
  }
}
