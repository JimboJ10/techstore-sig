import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BodegaService, LecturaIOT, EnvioPendiente } from '../../../services/bodega.service';

@Component({
  selector: 'app-lecturas-iot',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatPaginatorModule
  ],
  templateUrl: './lecturas-iot.component.html',
  styleUrl: './lecturas-iot.component.scss'
})
export class LecturasIotComponent implements OnInit {
  lecturas: LecturaIOT[] = [];
  envios: EnvioPendiente[] = [];

  loadingLecturas = true;
  loadingEnvios = true;
  errorLecturas = '';
  errorEnvios = '';
  lecturasPageIndex = 0;
  lecturasPageSize = 10;
  enviosPageIndex = 0;
  enviosPageSize = 10;
  readonly pageSizeOptions = [10, 25, 50];

  columnasLecturas = ['id_lectura', 'nombre_producto', 'codigo_leido', 'tipo_evento', 'id_dispositivo', 'id_envio', 'fecha_lectura'];
  columnasEnvios = ['id_envio', 'id_pedido', 'cliente', 'nombre_producto', 'codigo_barras', 'cantidad', 'estado_envio'];

  constructor(
    private bodegaService: BodegaService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarLecturas();
    this.cargarEnvios();
  }

  cargarLecturas(): void {
    this.loadingLecturas = true;
    this.errorLecturas = '';

    this.bodegaService.listarLecturas().subscribe({
      next: (data) => {
        this.lecturas = data;
        this.lecturasPageIndex = 0;
        this.loadingLecturas = false;
      },
      error: () => {
        this.errorLecturas = 'No se pudieron cargar las lecturas IoT';
        this.loadingLecturas = false;
      }
    });
  }

  cargarEnvios(): void {
    this.loadingEnvios = true;
    this.errorEnvios = '';

    this.bodegaService.listarEnviosPendientes().subscribe({
      next: (data) => {
        this.envios = data;
        this.enviosPageIndex = 0;
        this.loadingEnvios = false;
      },
      error: () => {
        this.errorEnvios = 'No se pudieron cargar los envíos pendientes';
        this.loadingEnvios = false;
      }
    });
  }

  getTipoColor(tipo: string): string {
    switch (tipo) {
      case 'Despacho': return 'primary';
      case 'Recepcion': return 'accent';
      default: return '';
    }
  }

  getEstadoEnvioColor(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'warn';
      case 'En preparacion': return 'accent';
      case 'Despachado': return 'primary';
      default: return '';
    }
  }

  getTotalLecturas(): number {
    return this.lecturas.length;
  }

  getTotalDespachos(): number {
    return this.lecturas.filter(l => l.tipo_evento === 'Despacho').length;
  }

  getTotalEnviosPendientes(): number {
    return this.envios.filter(e => e.estado_envio === 'Pendiente').length;
  }

  refrescar(): void {
    this.cargarLecturas();
    this.cargarEnvios();
    this.snackBar.open('Datos actualizados', 'Cerrar', { duration: 2000 });
  }

  get lecturasPaginadas(): LecturaIOT[] {
    const start = this.lecturasPageIndex * this.lecturasPageSize;
    return this.lecturas.slice(start, start + this.lecturasPageSize);
  }

  get enviosPaginados(): EnvioPendiente[] {
    const start = this.enviosPageIndex * this.enviosPageSize;
    return this.envios.slice(start, start + this.enviosPageSize);
  }

  cambiarPaginaLecturas(event: PageEvent): void {
    this.lecturasPageIndex = event.pageIndex;
    this.lecturasPageSize = event.pageSize;
  }

  cambiarPaginaEnvios(event: PageEvent): void {
    this.enviosPageIndex = event.pageIndex;
    this.enviosPageSize = event.pageSize;
  }
}
