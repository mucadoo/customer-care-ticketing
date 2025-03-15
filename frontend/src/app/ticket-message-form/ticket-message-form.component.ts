import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-ticket-message-form',
  templateUrl: './ticket-message-form.component.html',
  styleUrls: ['./ticket-message-form.component.scss']
})
export class TicketMessageFormComponent {
  @Input() form!: FormGroup;
  @Input() disabled: boolean = false;
  @Output() submitMessage = new EventEmitter<void>();

  onSubmit() {
    if (this.form.valid) {
      this.submitMessage.emit();
    }
  }
}
