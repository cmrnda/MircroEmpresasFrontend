import { Routes } from '@angular/router';
import { authGuard, typeGuard } from './core/auth/guards';
import { LoginPage } from './auth/login.page';
import { TenantsPage } from './platform/tenants.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login/platform' },
  { path: 'login/:mode', component: LoginPage },

  {
    path: 'platform',
    canActivate: [authGuard, typeGuard('platform')],
    children: [
      { path: 'tenants', component: TenantsPage }
    ]
  },

  {
    path: 'tenant',
    canActivate: [authGuard, typeGuard('user')],
    children: [
      { path: 'users', loadComponent: () => import('./tenant/users.page').then(m => m.UsersPage) },
      { path: 'clients', loadComponent: () => import('./tenant/clients.page').then(m => m.ClientsPage) }
    ]
  },

  {
    path: 'client',
    canActivate: [authGuard, typeGuard('client')],
    children: [
      { path: 'home', loadComponent: () => import('./client/home.page').then(m => m.ClientHomePage) }
    ]
  },

  { path: '**', redirectTo: 'login/platform' }
];
