import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BulkReplyComponent, BulkReplyData } from '../bulk-reply/bulk-reply.component';
import { TicketsService } from '../api/tickets.service';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { Ticket } from '../models/ticket.model';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss']
})
export class TicketsListComponent implements OnInit {
  protected ticketsSubject = new BehaviorSubject<Ticket[]>([]);
  tickets$ = this.ticketsSubject.asObservable();

  filterStatus = this.fb.control<'all' | 'resolved' | 'unresolved'>('all');

  filteredTickets$: Observable<Ticket[]> = combineLatest([
    this.tickets$,
    this.filterStatus.valueChanges.pipe(startWith('all'))
  ]).pipe(
    map(([tickets, filter]) => {
      if (!filter || filter === 'all') {
        return tickets;
      }
      return tickets.filter(ticket => ticket.status.toLowerCase() === filter);
    })
  );

  selectedTicketIds = new Set<number>();
  selectAll = false;

  constructor(
    private api: TicketsService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.api.getTickets().pipe(
      map(tickets => tickets.map(ticket => ({ ...ticket, selected: false })))
    ).subscribe(tickets => {
      this.ticketsSubject.next(tickets);
      this.selectAll = false;
      this.selectedTicketIds.clear();
    });
  }

  onTicketSelectionChange(ticket: Ticket): void {
    if (ticket.selected) {
      this.selectedTicketIds.add(ticket.id);
    } else {
      this.selectedTicketIds.delete(ticket.id);
      this.selectAll = false;
    }
  }

  toggleSelectAll(event: MatCheckboxChange): void {
    const newVal = event.checked;
    this.selectAll = newVal;
    this.filteredTickets$.subscribe(filtered => {
      const updatedTickets = this.ticketsSubject.value.map(ticket => {
        if (filtered.some(t => t.id === ticket.id)) {
          ticket.selected = newVal;
        }
        return ticket;
      });
      this.ticketsSubject.next([...updatedTickets]);

      if (newVal) {
        filtered.forEach(ticket => this.selectedTicketIds.add(ticket.id));
      } else {
        filtered.forEach(ticket => this.selectedTicketIds.delete(ticket.id));
      }
    }).unsubscribe();
  }

  trackByTicket(index: number, ticket: Ticket): number {
    return ticket.id;
  }

  openBulkReplyModal(): void {
    const dialogRef = this.dialog.open<BulkReplyComponent, BulkReplyData, any>(BulkReplyComponent, {
      width: '500px',
      data: { selectedTicketIds: Array.from(this.selectedTicketIds) }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Bulk reply modal closed', result);
      // Reset selection after modal closes.
      const resetTickets = this.ticketsSubject.value.map(ticket => ({ ...ticket, selected: false }));
      this.ticketsSubject.next(resetTickets);
      this.selectedTicketIds.clear();
      this.selectAll = false;
    });
  }
}
