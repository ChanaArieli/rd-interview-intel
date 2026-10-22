import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateInterviewSubmissionDto } from '@rd-intel/shared';

@Injectable({
  providedIn: 'root'
})
export class InterviewsService {
  private apiUrl = 'http://localhost:3001/api/interviews';

  constructor(private http: HttpClient) {}

  submitInterview(data: CreateInterviewSubmissionDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, data);
  }
}
