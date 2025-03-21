import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketsService } from '../api/tickets.service';

export interface BulkReplyData {
  selectedTicketIds: number[];
}

@Component({
  selector: 'app-bulk-reply',
  templateUrl: './bulk-reply.component.html',
  styleUrls: ['./bulk-reply.component.scss']
})
export class BulkReplyComponent implements OnInit {
  bulkReplyForm = this.fb.group({
    text: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private ticketsService: TicketsService,
    public dialogRef: MatDialogRef<BulkReplyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BulkReplyData
  ) {}

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.bulkReplyForm.invalid) {
      return;
    }
    const payload = {
      ticketIds: this.data.selectedTicketIds,
      senderType: 'operator' as const,
      senderId: localStorage.getItem('senderId')!,
      text: this.bulkReplyForm.value.text!
    };
    this.ticketsService.sendBulkReply(payload).subscribe(response => {
      console.log('Bulk reply job started with jobId:', response.jobId);
      this.dialogRef.close(response.jobId);
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
