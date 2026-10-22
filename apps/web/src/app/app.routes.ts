import { Routes } from '@angular/router';
import { CompaniesListComponent } from './companies/companies-list/companies-list.component';
import { CompanyDetailComponent } from './companies/company-detail/company-detail.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'companies',
    pathMatch: 'full'
  },
  {
    path: 'companies',
    component: CompaniesListComponent
  },
  {
    path: 'companies/:slug',
    component: CompanyDetailComponent
  }
];
