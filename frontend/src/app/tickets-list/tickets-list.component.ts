import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BulkReplyComponent, BulkReplyData } from '../bulk-reply/bulk-reply.component';
import { TicketsService } from '../api/tickets.service';
import { concat, map, Observable, switchMap, of } from 'rxjs';
import { take } from 'rxjs/operators';
import {Ticket} from "../models/ticket.model";

type ItemList = Ticket & {};

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss']
})
export class TicketsListComponent implements OnInit {
  tickets: Observable<ItemList[]> = of([]);
  selectedTicketIds: number[] = [];
  filterStatus = this.fb.control<"all" | "resolved" | "unresolved">("all");
  selectAll = false;

  constructor(
    private api: TicketsService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.tickets = concat(
      this.api.getTickets().pipe(
        map(tickets => tickets.map(ticket => ({ ...ticket, selected: false })))
      ),
      this.filterStatus.valueChanges.pipe(
        map(value => {
          if (!value || value === "all") return undefined;
          return value;
        }),
        switchMap(status => this.api.getTickets(status).pipe(
          map(tickets => tickets.map(ticket => ({ ...ticket, selected: false })))
        ))
      )
    );
  }

  onTicketSelectionChange(ticket: Ticket): void {
    if (ticket.selected) {
      if (!this.selectedTicketIds.includes(ticket.id)) {
        this.selectedTicketIds.push(ticket.id);
      }
    } else {
      this.selectedTicketIds = this.selectedTicketIds.filter(id => id !== ticket.id);
      this.selectAll = false;
    }
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.tickets.pipe(take(1)).subscribe(tickets => {
      tickets.forEach(ticket => {
        ticket.selected = this.selectAll;
      });
      if (this.selectAll) {
        this.selectedTicketIds = tickets.map(ticket => ticket.id);
      } else {
        this.selectedTicketIds = [];
      }
    });
  }

  openBulkReplyModal(): void {
    const dialogRef = this.dialog.open<BulkReplyComponent, BulkReplyData, any>(BulkReplyComponent, {
      width: '500px',
      data: { selectedTicketIds: this.selectedTicketIds }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Bulk reply modal closed', result);
      this.selectedTicketIds = [];
      this.tickets.pipe(take(1)).subscribe(tickets => {
        tickets.forEach(ticket => ticket.selected = false);
      });
      this.selectAll = false;
    });
  }
}
