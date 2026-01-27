export type NavItem = {
  label: string;
  icon: string;
  link: string;
  exact?: boolean;
};

export type Brand = {
  icon: string;
  title: string;
  subtitle?: string;
  logoAsset?: string;
};

export type TitleRule = {
  prefix: string;
  title: string;
};

export type LayoutConfig = {
  brand: Brand;
  maxWidthClass?: string;
  nav: NavItem[];
  mobileNav?: NavItem[];
  titles: {
    rules: TitleRule[];
    fallback: string;
  };
  footer: {
    showType?: boolean;
    showUsuarioId?: boolean;
    showEmpresaId?: boolean;
    showClienteId?: boolean;
    warnEmpresaMissing?: boolean;
    logoutIfHasToken?: boolean;
  };
  header: {
    showNotifications?: boolean;
    showEmpresaId?: boolean;
  };
};

export const LAYOUTS: Record<string, LayoutConfig> = {
  platform: {
    brand: { icon: 'shield', title: 'Plataforma', subtitle: 'Plataforma' },
    maxWidthClass: 'max-w-7xl',
    nav: [
      { label: 'Empresas', icon: 'apartment', link: '/platform/tenants', exact: true },
      { label: 'Clientes', icon: 'groups', link: '/platform/clients', exact: true },
      { label: 'Suscripciones', icon: 'payments', link: '/platform/subscriptions', exact: true },
      { label: 'Planes', icon: 'sell', link: '/platform/plans', exact: true },
      { label: 'Reset password', icon: 'lock_reset', link: '/platform/reset-password', exact: true },
      { label: 'Mi password', icon: 'manage_accounts', link: '/account/password', exact: true }
    ],
    mobileNav: [
      { label: 'Empresas', icon: 'apartment', link: '/platform/tenants', exact: true },
      { label: 'Clientes', icon: 'groups', link: '/platform/clients', exact: true },
      { label: 'Subs', icon: 'payments', link: '/platform/subscriptions', exact: true },
      { label: 'Planes', icon: 'sell', link: '/platform/plans', exact: true },
      { label: 'Cuenta', icon: 'manage_accounts', link: '/account/password', exact: true }
    ],
    titles: {
      rules: [
        { prefix: '/platform/tenants', title: 'Empresas' },
        { prefix: '/platform/clients', title: 'Clientes' },
        { prefix: '/platform/subscriptions', title: 'Suscripciones' },
        { prefix: '/platform/plans', title: 'Planes' },
        { prefix: '/platform/reset-password', title: 'Reset password' }
      ],
      fallback: 'Resumen plataforma'
    },
    footer: { showType: true, showUsuarioId: true, showEmpresaId: true, logoutIfHasToken: false },
    header: { showNotifications: true, showEmpresaId: false }
  },

  tenant: {
    brand: { icon: 'store', title: 'Tenant', subtitle: 'Tenant' },
    maxWidthClass: 'max-w-7xl',
    nav: [
      { label: 'Productos', icon: 'shopping_bag', link: '/tenant/products', exact: true },
      { label: 'Categorias', icon: 'category', link: '/tenant/categories', exact: true },
      { label: 'Pedidos', icon: 'receipt_long', link: '/tenant/orders', exact: true },
      { label: 'Clientes', icon: 'groups', link: '/tenant/clients', exact: true },
      { label: 'Usuarios', icon: 'manage_accounts', link: '/tenant/users', exact: true },
      { label: 'Proveedores', icon: 'local_shipping', link: '/tenant/suppliers', exact: true },
      { label: 'POS', icon: 'point_of_sale', link: '/tenant/pos', exact: true },
      { label: 'Compras', icon: 'shopping_cart', link: '/tenant/purchases', exact: true },
      { label: 'Finanzas', icon: 'account_balance_wallet', link: '/tenant/finance', exact: true },
      { label: 'Configuraciones', icon: 'settings', link: '/tenant/settings', exact: true },
      { label: 'Mi password', icon: 'lock', link: '/account/password', exact: true }
    ],
    mobileNav: [
      { label: 'Prod', icon: 'shopping_bag', link: '/tenant/products', exact: true },
      { label: 'Cat', icon: 'category', link: '/tenant/categories', exact: true },
      { label: 'Prov', icon: 'local_shipping', link: '/tenant/suppliers', exact: true },
      { label: 'Comp', icon: 'shopping_cart', link: '/tenant/purchases', exact: true },
      { label: 'Gast', icon: 'account_balance_wallet', link: '/tenant/finance', exact: true }
    ],
    titles: {
      rules: [
        { prefix: '/tenant/products', title: 'Productos' },
        { prefix: '/tenant/categories', title: 'Categorias' },
        { prefix: '/tenant/orders', title: 'Pedidos' },
        { prefix: '/tenant/clients', title: 'Clientes' },
        { prefix: '/tenant/users', title: 'Usuarios' },
        { prefix: '/tenant/settings', title: 'Configuraciones' },
        { prefix: '/tenant/suppliers', title: 'Proveedores' },
        { prefix: '/tenant/purchases', title: 'Compras' },
        { prefix: '/tenant/finance', title: 'Finanzas' },
        { prefix: '/tenant/pos', title: 'POS' }
      ],
      fallback: 'Resumen tenant'
    },
    footer: { showType: true, showUsuarioId: true, showEmpresaId: true, logoutIfHasToken: false },
    header: { showNotifications: true, showEmpresaId: false }
  },

  client: {
    brand: { icon: 'storefront', title: 'Cliente', subtitle: 'Cliente' },
    maxWidthClass: 'max-w-none',
    nav: [{ label: 'Tienda', icon: 'store', link: 'shop', exact: true }],
    mobileNav: [{ label: 'Tienda', icon: 'store', link: 'shop', exact: true }],
    titles: {
      rules: [{ prefix: '/shop', title: 'Tienda' }],
      fallback: 'Cliente'
    },
    footer: { showType: true, showClienteId: true, showEmpresaId: true, warnEmpresaMissing: true, logoutIfHasToken: true },
    header: { showNotifications: false, showEmpresaId: true }
  }
};
