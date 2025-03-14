import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobStatusPipe } from './pipes/job-icon.pipe';

@NgModule({
  declarations: [JobStatusPipe],
  imports: [CommonModule],
  exports: [JobStatusPipe]
})
export class SharedModule { }
