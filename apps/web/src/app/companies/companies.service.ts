import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanySummaryDto } from '@rd-intel/shared';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  private apiUrl = 'http://localhost:3001/api/companies';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CompanySummaryDto[]> {
    return this.http.get<CompanySummaryDto[]>(this.apiUrl);
  }

  getBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${slug}`);
  }
}
