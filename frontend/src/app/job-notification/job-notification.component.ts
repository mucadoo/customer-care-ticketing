import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { JobStateService, JobNotification } from '../api/job-state.service';
import { JobWebSocketService } from '../api/job-websocket.service';

@Component({
  selector: 'app-job-notification',
  templateUrl: './job-notification.component.html',
  styleUrls: ['./job-notification.component.scss']
})
export class JobNotificationComponent implements OnInit, OnDestroy {
  @ViewChild('notifButton', { static: true }) notifButton!: ElementRef;

  jobs$ = this.jobStateService.jobs$;
  activeJobCount = 0;
  selectedFilter: string = 'all';
  highlight = false;

  private subscription!: Subscription;
  private previousActiveCount = 0;

  constructor(
    private jobStateService: JobStateService,
    private jobWsService: JobWebSocketService
  ) {}

  ngOnInit(): void {
    const senderId = localStorage.getItem('senderId')!;
    this.jobWsService.connect(senderId);

    this.subscription = this.jobStateService.jobs$.subscribe(jobs => {
      const newCount = jobs.filter(job => job.state === 'active' || job.state === 'waiting').length;
      if (newCount > this.previousActiveCount) {
        this.triggerHighlight();
      }
      this.previousActiveCount = newCount;
      this.activeJobCount = newCount;
    });
  }

  private triggerHighlight(): void {
    this.highlight = true;
    setTimeout(() => {
      this.highlight = false;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

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
