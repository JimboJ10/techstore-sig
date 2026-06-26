import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProveedoresService, Proveedor } from '../../services/proveedores.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  loading = true;
  error = '';

  displayedColumns = ['id_proveedor', 'razon_social', 'ruc', 'correo', 'telefono', 'contacto_nombre'];

  constructor(
    private proveedoresService: ProveedoresService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.loading = true;
    this.error = '';

    this.proveedoresService.listar().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los proveedores';
        this.loading = false;
      }
    });
  }

  refrescar(): void {
    this.cargarProveedores();
    this.snackBar.open('Lista actualizada', 'Cerrar', { duration: 2000 });
  }
}
