import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-ticket-message-form',
  templateUrl: './ticket-message-form.component.html',
  styleUrls: ['./ticket-message-form.component.scss']
})
export class TicketMessageFormComponent {
  @Input() form!: FormGroup;
  @Input() disabled = false;
  @Output() submitMessage = new EventEmitter<void>();

  onSubmit(): void {
    if (this.form.valid) {
      this.submitMessage.emit();
    }
  }
}
