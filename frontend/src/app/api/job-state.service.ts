import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface JobNotification {
  jobId: string;
  name: string;
  createdAt: Date;
  completedAt?: Date | null;
  progress: number;
  state: 'waiting' | 'active' | 'completed' | 'failed' | string;
  result?: any;
  failedReason?: string;
  archived?: boolean;
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

  archiveJob(jobId: string) {
    const updatedJobs = this.jobs.map((job) =>
      job.jobId === jobId ? { ...job, archived: true } : job
    );
    this.jobsSubject.next(updatedJobs);
  }
}
