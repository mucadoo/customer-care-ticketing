import { Component, Input } from '@angular/core';
import { Message } from '../models/api-message.model';

@Component({
  selector: 'app-ticket-messages',
  templateUrl: './ticket-messages.component.html',
  styleUrls: ['./ticket-messages.component.scss']
})
export class TicketMessagesComponent {
  @Input() messages: Message[] = [];
}
