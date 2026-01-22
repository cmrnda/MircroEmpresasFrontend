import {Routes} from '@angular/router';
import {authGuard, typeGuard} from './core/auth/guards';
import {LoginPage} from './auth/login.page';
import {PlatformLayoutComponent} from './layout/platform-layout/platform-layout.component';
import {TenantLayoutComponent} from './layout/tenant-layout/tenant-layout.component';
import {ClientLayoutComponent} from './layout/client-layout/client-layout.component';
import {TenantsPage} from './pages/platform/tenant/tenants.page';

export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'login/platform'},
  {path: 'login/:mode', component: LoginPage},

  {
    path: 'platform',
    canActivate: [authGuard, typeGuard('platform')],
    component: PlatformLayoutComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'tenants'},
      {path: 'tenants', component: TenantsPage},
      {
        path: 'clients',
        loadComponent: () =>
          import('./pages/platform/clients/platform-clients.page').then(m => m.PlatformClientsPage)
      },
      {
        path: 'subscriptions',
        loadComponent: () =>
          import('./pages/platform/subscriptions/platform-subscriptions.page').then(m => m.PlatformSubscriptionsPage)
      },
      {
        path: 'plans',
        loadComponent: () =>
          import('./pages/platform/plans/platform-plans.page').then(m => m.PlatformPlansPage)
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/platform/reset-password/reset-password.page').then(m => m.PlatformResetPasswordPage)
      }
    ]
  },

  {
    path: 'tenant',
    canActivate: [authGuard, typeGuard('user')],
    component: TenantLayoutComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'products'},

      {
        path: 'users',
        loadComponent: () => import('./pages/tenant/users/tenant-users.page').then(m => m.TenantUsersPage)
      },
      {
        path: 'clients',
        loadComponent: () => import('./pages/tenant/clients/tenant-clients.page').then(m => m.TenantClientsPage)
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/tenant/categories/tenant-categories.page').then(m => m.TenantCategoriesPage)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/tenant/products/tenant-products.page').then(m => m.TenantProductsPage)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/tenant/orders/tenant-orders.page').then(m => m.TenantOrdersPage)
      },
      {
        path: 'orders/:venta_id',
        loadComponent: () => import('./pages/tenant/orders/tenant-order-detail.page').then(m => m.TenantOrderDetailPage)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/tenant/settings/tenant-settings.page').then(m => m.TenantSettingsPage)
      },

      {
        path: 'suppliers',
        loadComponent: () => import('./pages/tenant/suppliers/tenant-suppliers.page').then(m => m.TenantSuppliersPage)
      },
      {
        path: 'purchases',
        loadComponent: () => import('./pages/tenant/purchases/tenant-purchases.page').then(m => m.TenantPurchasesPage)
      },
      {
        path: 'expenses',
        loadComponent: () => import('./pages/tenant/finance/tenant-expenses.page').then(m => m.TenantExpensesPage)
      }
    ]
  },


  {
    path: 'client',
    canActivate: [authGuard, typeGuard('client')],
    component: ClientLayoutComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'shop'},

      {path: 'shop', loadComponent: () => import('./pages/client/shop/shop.page').then(m => m.ClientShopPage)},
      {path: 'cart', loadComponent: () => import('./pages/client/cart/cart.page').then(m => m.ClientCartPage)},
      {
        path: 'checkout',
        loadComponent: () => import('./pages/client/checkout/checkout.page').then(m => m.ClientCheckoutPage)
      },

      {path: 'orders', loadComponent: () => import('./pages/client/orders/orders.page').then(m => m.ClientOrdersPage)},
      {
        path: 'orders/:venta_id',
        loadComponent: () => import('./pages/client/orders/order-detail.page').then(m => m.ClientOrderDetailPage)
      }
    ]
  },


  {
    path: 'account',
    canActivate: [authGuard],
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'password'},
      {path: 'password', loadComponent: () => import('./shared/me-password.page').then(m => m.MePasswordPage)}
    ]
  },

  {path: '**', redirectTo: 'login/platform'}
];
