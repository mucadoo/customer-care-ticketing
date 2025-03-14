import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobsService {
  private baseUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  archiveJob(jobId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/jobs/${jobId}/archive`, {});
  }
}
