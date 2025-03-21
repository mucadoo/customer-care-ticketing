import {JobProgress} from "./job-progress.model";

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
