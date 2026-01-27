import { Routes } from '@angular/router';
import { authGuard, typeGuard } from './core/auth/guards';
import { LoginPage } from './auth/login.page';
import { TenantsPage } from './pages/platform/tenant/tenants.page';
import {AppLayoutComponent} from './layout/app-layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login/platform' },
  { path: 'login/:mode', component: LoginPage },

  {
    path: 'platform',
    canActivate: [authGuard, typeGuard('platform')],
    component: AppLayoutComponent,
    data: { layoutKey: 'platform' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tenants' },
      { path: 'tenants', component: TenantsPage, data: { layoutKey: 'platform' } },
      { path: 'clients', loadComponent: () => import('./pages/platform/clients/platform-clients.page').then(m => m.PlatformClientsPage), data: { layoutKey: 'platform' } },
      { path: 'subscriptions', loadComponent: () => import('./pages/platform/subscriptions/platform-subscriptions.page').then(m => m.PlatformSubscriptionsPage), data: { layoutKey: 'platform' } },
      { path: 'plans', loadComponent: () => import('./pages/platform/plans/platform-plans.page').then(m => m.PlatformPlansPage), data: { layoutKey: 'platform' } },
      { path: 'reset-password', loadComponent: () => import('./pages/platform/reset-password/reset-password.page').then(m => m.PlatformResetPasswordPage), data: { layoutKey: 'platform' } }
    ]
  },

  {
    path: 'tenant',
    canActivate: [authGuard, typeGuard('user')],
    component: AppLayoutComponent,
    data: { layoutKey: 'tenant' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      { path: 'users', loadComponent: () => import('./pages/tenant/users/tenant-users.page').then(m => m.TenantUsersPage), data: { layoutKey: 'tenant' } },
      { path: 'clients', loadComponent: () => import('./pages/tenant/clients/tenant-clients.page').then(m => m.TenantClientsPage), data: { layoutKey: 'tenant' } },
      { path: 'categories', loadComponent: () => import('./pages/tenant/categories/tenant-categories.page').then(m => m.TenantCategoriesPage), data: { layoutKey: 'tenant' } },
      { path: 'products', loadComponent: () => import('./pages/tenant/products/tenant-products.page').then(m => m.TenantProductsPage), data: { layoutKey: 'tenant' } },
      { path: 'orders', loadComponent: () => import('./pages/tenant/orders/tenant-orders.page').then(m => m.TenantOrdersPage), data: { layoutKey: 'tenant' } },
      { path: 'orders/:venta_id', loadComponent: () => import('./pages/tenant/orders/tenant-order-detail.page').then(m => m.TenantOrderDetailPage), data: { layoutKey: 'tenant' } },
      { path: 'settings', loadComponent: () => import('./pages/tenant/settings/tenant-settings.page').then(m => m.TenantSettingsPage), data: { layoutKey: 'tenant' } },
      { path: 'suppliers', loadComponent: () => import('./pages/tenant/suppliers/tenant-suppliers.page').then(m => m.TenantSuppliersPage), data: { layoutKey: 'tenant' } },
      { path: 'purchases', loadComponent: () => import('./pages/tenant/purchases/tenant-purchases.page').then(m => m.TenantPurchasesPage), data: { layoutKey: 'tenant' } },
      { path: 'expenses', loadComponent: () => import('./pages/tenant/finance/tenant-expenses.page').then(m => m.TenantExpensesPage), data: { layoutKey: 'tenant' } },
      { path: 'pos', loadComponent: () => import('./pages/tenant/pos/pos.page').then(m => m.TenantPosPage), data: { layoutKey: 'tenant' } }
    ]
  },

  {
    path: 'client/:empresa_id',
    component: AppLayoutComponent,
    data: { layoutKey: 'client' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'shop' },
      { path: 'shop', loadComponent: () => import('./pages/client/shop/shop.page').then(m => m.ClientShopPage), data: { layoutKey: 'client' } }
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
