import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface JobProgress {
  success: number;
  error: number;
  total: number;
}

export interface JobNotification {
  jobId: string;
  name: string;
  createdAt: Date;
  completedAt?: Date | null;
  progress?: JobProgress;
  state: 'waiting' | 'active' | 'completed' | 'failed' | string;
  result?: any;
  failedReason?: string;
}

@Injectable({
  providedIn: 'root',
})
export class JobStateService {
  private jobsSubject = new BehaviorSubject<JobNotification[]>([]);
  jobs$ = this.jobsSubject.asObservable();

  private get jobs(): JobNotification[] {
    return this.jobsSubject.getValue();
  }

  updateJob(job: JobNotification) {
    const index = this.jobs.findIndex((j) => j.jobId === job.jobId);
    if (index !== -1) {
      this.jobs[index] = { ...this.jobs[index], ...job };
    } else {
      this.jobs.push(job);
    }
    this.jobsSubject.next([...this.jobs]);
  }
}
