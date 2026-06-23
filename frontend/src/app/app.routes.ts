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