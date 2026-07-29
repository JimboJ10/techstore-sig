import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./components/inventario/inventario.component').then(m => m.InventarioComponent)
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./components/ventas/lista-ventas/lista-ventas.component').then(m => m.ListaVentasComponent)
      },
      {
        path: 'ventas/pos',
        loadComponent: () =>
          import('./components/ventas/pos/pos.component').then(m => m.PosComponent)
      },
      {
        path: 'ventas/:id',
        loadComponent: () =>
          import('./components/ventas/detalle-venta/detalle-venta.component').then(m => m.DetalleVentaComponent)
      },
      {
        path: 'bpm',
        loadComponent: () =>
          import('./components/bpm/lista-bpm/lista-bpm.component').then(m => m.ListaBpmComponent)
      },
      {
        path: 'bodega',
        loadComponent: () =>
          import('./components/bodega/lecturas-iot/lecturas-iot.component').then(m => m.LecturasIotComponent)
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./components/productos/productos.component').then(m => m.ProductosComponent)
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./components/clientes/clientes.component').then(m => m.ClientesComponent)
      },
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./components/proveedores/proveedores.component').then(m => m.ProveedoresComponent)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./components/perfil/perfil.component').then(m => m.PerfilComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];