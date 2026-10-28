import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateInterviewSubmissionDto,
  UpdateInterviewQuestionDto,
  InterviewQuestionDto
} from '@rd-intel/shared';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InterviewsService {
  private apiUrl = `${environment.apiUrl}/interviews`;

  constructor(private http: HttpClient) {}

  submitInterview(data: CreateInterviewSubmissionDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, data);
  }

  updateQuestion(
    id: string,
    data: UpdateInterviewQuestionDto
  ): Observable<InterviewQuestionDto> {
    return this.http.patch<InterviewQuestionDto>(
      `${this.apiUrl}/questions/${id}`,
      data
    );
  }

  deleteQuestion(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/questions/${id}`
    );
  }
}
