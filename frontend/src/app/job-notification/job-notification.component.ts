import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { JobStateService, JobNotification } from '../api/job-state.service';
import { JobWebSocketService } from '../api/job-websocket.service';
import {JobsService} from "../api/jobs.service";

@Component({
  selector: 'app-job-notification',
  templateUrl: './job-notification.component.html',
  styleUrls: ['./job-notification.component.scss']
})
export class JobNotificationComponent implements OnInit, OnDestroy {
  jobs$ = this.jobStateService.jobs$;
  currentSenderId = localStorage.getItem('senderId')!;
  activeJobCount = 0;
  private subscription!: Subscription;

  constructor(
    private jobStateService: JobStateService,
    private jobWsService: JobWebSocketService,
    private jobsService: JobsService
  ) {}

  ngOnInit(): void {
    this.jobWsService.connect(this.currentSenderId);
    this.subscription = this.jobStateService.jobs$.subscribe(jobs => {
      this.activeJobCount = jobs.filter(job => !job.archived).length;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  dismissJob(jobId: string): void {
    this.jobsService.archiveJob(jobId).subscribe(() => {
      this.jobStateService.archiveJob(jobId);
    });
  }

  getUnarchived(jobs: JobNotification[]): JobNotification[] {
    return jobs.filter(job => !job.archived);
  }

  trackByJob(index: number, job: JobNotification): string {
    return job.jobId;
  }
}
