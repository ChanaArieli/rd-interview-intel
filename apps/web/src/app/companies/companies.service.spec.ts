import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CompaniesService } from './companies.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CompaniesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the company list', () => {
    service.getAll().subscribe(companies => {
      expect(companies.length).toBe(0);
    });

    const req = http.expectOne(r => r.url.endsWith('/companies'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('requests a single company by slug', () => {
    service.getBySlug('wiz').subscribe();

    const req = http.expectOne(r => r.url.endsWith('/companies/wiz'));
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
