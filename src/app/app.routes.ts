import { Routes } from '@angular/router';
import { authGuard, typeGuard } from './core/auth/guards';
import { LoginPage } from './auth/login.page';
import { TenantsPage } from './platform/tenants.page';
import { ForbiddenPage } from './shared/forbidden.page';
import { PlatformLayoutComponent } from './layout/platform-layout.component';
import { TenantLayoutComponent } from './layout/tenant-layout.component';
import { ClientLayoutComponent } from './layout/client-layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login/platform' },
  { path: 'login/:mode', component: LoginPage },

  { path: 'forbidden', component: ForbiddenPage },

  {
    path: 'platform',
    canActivate: [authGuard, typeGuard('platform')],
    component: PlatformLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tenants' },

      { path: 'tenants', component: TenantsPage },

      {
        path: 'subscriptions',
        loadComponent: () =>
          import('./subscriptions/platform-subscriptions.page').then(m => m.PlatformSubscriptionsPage)
      },

      {
        path: 'reset-password',
        loadComponent: () =>
          import('./platform/reset-password.page').then(m => m.PlatformResetPasswordPage)
      }
    ]
  },

  {
    path: 'tenant',
    canActivate: [authGuard, typeGuard('user')],
    component: TenantLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users' },

      { path: 'users', loadComponent: () => import('./tenant/users.page').then(m => m.UsersPage) },
      { path: 'clients', loadComponent: () => import('./tenant/clients.page').then(m => m.ClientsPage) },

      {
        path: 'subscription',
        loadComponent: () =>
          import('./tenant/tenant-subscription.page').then(m => m.TenantSubscriptionPage)
      },

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
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', loadComponent: () => import('./client/home.page').then(m => m.ClientHomePage) }
    ]
  },

  {
    path: 'account',
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'password' },
      { path: 'password', loadComponent: () => import('./shared/me-password.page').then(m => m.MePasswordPage) }
    ]
  },

  { path: '**', redirectTo: 'login/platform' }
];
