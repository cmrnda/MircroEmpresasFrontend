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

      {path: 'users', loadComponent: () => import('./pages/tenant/users/users.page').then(m => m.UsersPage)},
      {
        path: 'clients',
        loadComponent: () => import('./pages/tenant/clients/clients.page').then(m => m.TenantClientsPage)
      },

      {
        path: 'categories',
        loadComponent: () => import('./pages/tenant/categories/categories.page').then(m => m.TenantCategoriesPage)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/tenant/products/products.page').then(m => m.TenantProductsPage)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./pages/tenant/inventory/inventory.page').then(m => m.TenantInventoryPage)
      },
      {path: 'orders', loadComponent: () => import('./pages/tenant/orders/orders.page').then(m => m.TenantOrdersPage)},
      {
        path: 'orders/:venta_id',
        loadComponent: () => import('./pages/tenant/orders/order-detail.page').then(m => m.TenantOrderDetailPage)
      },
      // {
      //   path: 'subscription',
      //   loadComponent: () =>
      //     import('./pages/tenant/subscription/tenant-subscription.page').then(m => m.TenantSubscriptionPage)
      // },
      //
      // {
      //   path: 'password-resets',
      //   loadComponent: () => import('./pages/tenant/password-resets/password-resets.page').then(m => m.TenantPasswordResetsPage)
      // }
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
