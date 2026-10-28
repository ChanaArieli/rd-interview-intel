import { Routes } from '@angular/router';
import { CompaniesListComponent } from './companies/companies-list/companies-list.component';
import { CompanyDetailComponent } from './companies/company-detail/company-detail.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { authGuard, guestGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'companies',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'companies',
    component: CompaniesListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'companies/:slug',
    component: CompanyDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'companies'
  }
];
