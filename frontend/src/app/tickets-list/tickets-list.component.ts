import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BulkReplyComponent, BulkReplyData } from '../bulk-reply/bulk-reply.component';
import { TicketsService } from '../api/tickets.service';
import { BehaviorSubject, combineLatest, Observable, Subscription, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { Ticket } from '../models/ticket.model';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss']
})
export class TicketsListComponent implements OnInit, OnDestroy {
  // All tickets stored in a BehaviorSubject
  protected ticketsSubject = new BehaviorSubject<Ticket[]>([]);
  tickets$ = this.ticketsSubject.asObservable();

  // Form control for filter (all/resolved/unresolved)
  filterStatus = this.fb.control<'all' | 'resolved' | 'unresolved'>('all');

  // Derived observable for filtered tickets
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

  // Selected ticket IDs maintained as a Set for fast lookup
  selectedTicketIds = new Set<number>();
  selectAll = false;

  private subscriptions = new Subscription();

  constructor(
    private api: TicketsService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Load initial tickets from API (and mark each as not selected)
    this.api.getTickets().pipe(
      map(tickets => tickets.map(ticket => ({ ...ticket, selected: false })))
    ).subscribe(tickets => {
      this.ticketsSubject.next(tickets);
      this.selectAll = false;
      this.selectedTicketIds.clear();
    });

    // Subscribe to filtered tickets to update the selectAll flag
    this.subscriptions.add(
      this.filteredTickets$.subscribe(filtered => {
        // If there are filtered tickets and all are selected, set selectAll true
        if (filtered.length > 0 && filtered.every(ticket => ticket.selected)) {
          this.selectAll = true;
        } else {
          this.selectAll = false;
        }
      })
    );
  }

  // Returns the current filtered tickets as an array from the BehaviorSubject
  getFilteredTickets(): Ticket[] {
    const filter = this.filterStatus.value;
    const tickets = this.ticketsSubject.value;
    if (!filter || filter === 'all') {
      return tickets;
    }
    return tickets.filter(ticket => ticket.status.toLowerCase() === filter);
  }

  // When an individual ticket is toggled
  onTicketSelectionChange(ticket: Ticket): void {
    const updatedTickets = this.ticketsSubject.value.map(t => {
      if (t.id === ticket.id) {
        return { ...t, selected: ticket.selected };
      }
      return t;
    });
    this.ticketsSubject.next(updatedTickets);
    if (ticket.selected) {
      this.selectedTicketIds.add(ticket.id);
    } else {
      this.selectedTicketIds.delete(ticket.id);
    }
  }

  // Toggle select all for currently filtered tickets
  toggleSelectAll(event: MatCheckboxChange): void {
    const newVal = event.checked;
    this.selectAll = newVal;
    const filtered = this.getFilteredTickets();

    // Update tickets in the global array for only filtered items
    const updatedTickets = this.ticketsSubject.value.map(ticket => {
      if (filtered.find(t => t.id === ticket.id)) {
        return { ...ticket, selected: newVal };
      }
      return ticket;
    });
    this.ticketsSubject.next(updatedTickets);

    // Update the set of selected ticket IDs based on filtered tickets
    if (newVal) {
      filtered.forEach(ticket => this.selectedTicketIds.add(ticket.id));
    } else {
      filtered.forEach(ticket => this.selectedTicketIds.delete(ticket.id));
    }
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
      // Reset selection after modal closes
      const resetTickets = this.ticketsSubject.value.map(ticket => ({ ...ticket, selected: false }));
      this.ticketsSubject.next(resetTickets);
      this.selectedTicketIds.clear();
      this.selectAll = false;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
