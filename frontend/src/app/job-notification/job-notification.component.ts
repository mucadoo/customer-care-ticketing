import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { JobStateService, JobNotification } from '../api/job-state.service';
import { JobWebSocketService } from '../api/job-websocket.service';

@Component({
  selector: 'app-job-notification',
  templateUrl: './job-notification.component.html',
  styleUrls: ['./job-notification.component.scss']
})
export class JobNotificationComponent implements OnInit, OnDestroy {
  jobs$ = this.jobStateService.jobs$;
  currentSenderId = localStorage.getItem('senderId')!;
  activeJobCount = 0;
  selectedFilter: string = 'all';
  private subscription!: Subscription;

  constructor(
    private jobStateService: JobStateService,
    private jobWsService: JobWebSocketService
  ) {}

  ngOnInit(): void {
    this.jobWsService.connect(this.currentSenderId);
    this.subscription = this.jobStateService.jobs$.subscribe(jobs => {
      // Count jobs that are not archived; now archive functionality is removed, so count all jobs.
      this.activeJobCount = jobs.length;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Filter jobs based on selected filter and sort descending by createdAt
  getFilteredJobs(jobs: JobNotification[]): JobNotification[] {
    const filtered = jobs.filter(job =>
      this.selectedFilter === 'all' || job.state === this.selectedFilter
    );
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  trackByJob(index: number, job: JobNotification): string {
    return job.jobId;
  }

}
