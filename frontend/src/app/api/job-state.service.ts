import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {JobNotification} from "../models/job-notification.model";

@Injectable({
  providedIn: 'root'
})
export class JobStateService {
  private jobsSubject = new BehaviorSubject<JobNotification[]>([]);
  public jobs$: Observable<JobNotification[]> = this.jobsSubject.asObservable();

  private get jobs(): JobNotification[] {
    return this.jobsSubject.getValue();
  }

  updateJob(job: JobNotification): void {
    const index = this.jobs.findIndex(j => j.jobId === job.jobId);
    if (index !== -1) {
      this.jobs[index] = { ...this.jobs[index], ...job };
    } else {
      this.jobs.push(job);
    }
    this.jobsSubject.next([...this.jobs]);
  }
}
