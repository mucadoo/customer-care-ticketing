import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobIconPipe } from './pipes/job-icon.pipe';

@NgModule({
  declarations: [JobIconPipe],
  imports: [CommonModule],
  exports: [JobIconPipe]
})
export class SharedModule { }
