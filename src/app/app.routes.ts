import {Routes} from '@angular/router';
import {authGuard, typeGuard} from './core/auth/guards';
import {LoginPage} from './auth/login.page';
import {TenantsPage} from './platform/tenants.page';
import {PlatformLayoutComponent} from './layout/platform-layout.component';
import {TenantLayoutComponent} from './layout/tenant-layout.component';
import {ClientLayoutComponent} from './layout/client-layout.component';

export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'login/platform'},
  {path: 'login/:mode', component: LoginPage},

  {
    path: 'platform',
    canActivate: [authGuard, typeGuard('platform')],
    component: PlatformLayoutComponent,
    children: [
      {path: 'tenants', component: TenantsPage},
      {
        path: 'reset-password',
        loadComponent: () => import('./platform/reset-password.page').then(m => m.PlatformResetPasswordPage)
      }
    ]
  },

  {
    path: 'tenant',
    canActivate: [authGuard, typeGuard('user')],
    component: TenantLayoutComponent,
    children: [
      {path: 'users', loadComponent: () => import('./tenant/users.page').then(m => m.UsersPage)},
      {path: 'clients', loadComponent: () => import('./tenant/clients.page').then(m => m.ClientsPage)},
      {
        path: 'password-resets',
        loadComponent: () => import('./tenant/password-resets.page').then(m => m.TenantPasswordResetsPage)
      }
    ]
  },

  {
    path: 'client',
    canActivate: [authGuard, typeGuard('client')],
    component: ClientLayoutComponent,
    children: [
      {path: 'home', loadComponent: () => import('./client/home.page').then(m => m.ClientHomePage)}
    ]
  },

  {
    path: 'account',
    canActivate: [authGuard],
    children: [
      {path: 'password', loadComponent: () => import('./shared/me-password.page').then(m => m.MePasswordPage)}
    ]
  },

  {path: '**', redirectTo: 'login/platform'}
];
