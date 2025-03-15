import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JobWebSocketService } from '../api/job-websocket.service';
import {JobStateService} from "../api/job-state.service";
import {JobNotification} from "../models/job-notification.model";

@Component({
  selector: 'app-job-notification',
  templateUrl: './job-notification.component.html',
  styleUrls: ['./job-notification.component.scss']
})
export class JobNotificationComponent implements OnInit, OnDestroy {
  jobs$ = this.jobStateService.jobs$;
  activeJobCount = 0;
  selectedFilter = 'all';
  highlight = false;

  private unsubscribe$ = new Subject<void>();
  private previousActiveCount = 0;

  constructor(
    private jobStateService: JobStateService,
    private jobWsService: JobWebSocketService
  ) {}

  ngOnInit(): void {
    this.jobWsService.connect(localStorage.getItem('senderId')!);

    this.jobStateService.jobs$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(jobs => {
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
    setTimeout(() => (this.highlight = false), 3000);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getFilteredJobs(jobs: JobNotification[]): JobNotification[] {
    return jobs
      .filter(job => this.selectedFilter === 'all' || job.state === this.selectedFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  trackByJob(index: number, job: JobNotification): string {
    return job.jobId;
  }
}
