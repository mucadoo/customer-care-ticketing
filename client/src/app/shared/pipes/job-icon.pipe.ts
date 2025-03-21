import { Pipe, PipeTransform } from '@angular/core';
import {JobNotification} from "../../models/job-notification.model";

@Pipe({
  name: 'jobStatus'
})
export class JobStatusPipe implements PipeTransform {
  transform(job: JobNotification): { icon: string; class: string; tooltip: string } {
    let icon = 'hourglass_empty';
    let cssClass = 'default-icon';
    let tooltip = 'Job waiting to start';

    if (job.state === 'active' && job.progress) {
      const { success, error, total } = job.progress;
      const processed = success + error;
      const left = total - processed;
      tooltip = `⏳ In progress: ${processed} processed, ${left} left`;
      icon = 'autorenew';
      cssClass = 'active-icon';
    } else if (job.state === 'completed' && job.progress) {
      const { success, error, total } = job.progress;
      if (error === 0) {
        icon = 'check_circle';
        cssClass = 'completed-icon';
      } else if (error > 0 && error < total) {
        icon = 'warning';
        cssClass = 'warning-icon';
      } else if (error === total) {
        icon = 'error';
        cssClass = 'error-icon';
      }
      const parts = [];
      if (success > 0) parts.push(`✅ Success: ${success}`);
      if (error > 0) parts.push(`❌ Errors: ${error}`);
      tooltip = parts.length ? `${parts.join(' | ')} (Total: ${total})` : `Completed: ${total} processed`;
    } else if (job.state === 'failed') {
      icon = 'error';
      cssClass = 'failed-icon';
      tooltip = 'Job failed';
    }

    return { icon, class: cssClass, tooltip };
  }
}
