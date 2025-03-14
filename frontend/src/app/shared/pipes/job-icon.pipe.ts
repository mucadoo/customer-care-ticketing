import { Pipe, PipeTransform } from '@angular/core';
import {JobNotification} from "../../api/job-state.service";

@Pipe({
  name: 'jobIcon'
})
export class JobIconPipe implements PipeTransform {
  transform(job: JobNotification): { icon: string; class: string } {
    if (job.state !== 'completed' || !job.progress || typeof job.progress !== 'object') {
      return { icon: 'check_circle', class: 'completed-icon' };
    }
    const { success, error, total } = job.progress;
    if (error === 0) {
      return { icon: 'check_circle', class: 'completed-icon' };
    } else if (error > 0 && error < total) {
      return { icon: 'warning', class: 'warning-icon' };
    } else if (error === total) {
      return { icon: 'error', class: 'error-icon' };
    }
    return { icon: 'check_circle', class: 'completed-icon' };
  }
}
