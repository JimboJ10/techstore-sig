import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  rol: string | null;

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['Gerente'] },
    { label: 'Inventario', icon: 'inventory', route: '/inventario', roles: ['Gerente', 'Administrador', 'Vendedor', 'Bodeguero'] },
    { label: 'Ventas', icon: 'point_of_sale', route: '/ventas', roles: ['Gerente', 'Vendedor'] },
    { label: 'POS', icon: 'shopping_cart', route: '/ventas/pos', roles: ['Vendedor', 'Gerente'] },
    { label: 'BPM Compras', icon: 'receipt_long', route: '/bpm', roles: ['Gerente', 'Administrador', 'Bodeguero'] },
    { label: 'Bodega IoT', icon: 'qr_code_scanner', route: '/bodega', roles: ['Bodeguero', 'Gerente'] }
  ];

  constructor(private authService: AuthService) {
    this.rol = this.authService.getRol();
  }

  itemVisible(roles: string[]): boolean {
    return roles.includes(this.rol || '');
  }
}
