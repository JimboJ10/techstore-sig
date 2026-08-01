import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BodegaService, LecturaIOT, EnvioPendiente } from '../../../services/bodega.service';

@Component({
  selector: 'app-lecturas-iot',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatTableModule, MatIconModule, MatButtonModule, MatChipsModule,
    MatProgressSpinnerModule, MatTabsModule, MatTooltipModule, MatSnackBarModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  templateUrl: './lecturas-iot.component.html',
  styleUrl: './lecturas-iot.component.scss'
})
export class LecturasIotComponent implements OnInit, OnDestroy {
  todasLecturas: LecturaIOT[] = [];
  lecturas: LecturaIOT[] = [];
  envios: EnvioPendiente[] = [];
  todosEnvios: EnvioPendiente[] = [];

  loadingLecturas = true;
  loadingEnvios = true;
  errorLecturas = '';
  errorEnvios = '';
  lecturasPageIndex = 0;
  lecturasPageSize = 10;
  enviosPageIndex = 0;
  enviosPageSize = 10;
  readonly pageSizeOptions = [10, 25, 50];

  // Filtros lecturas
  busquedaLecturas = '';
  filtroTipoEvento = '';
  busquedaLecturasSubject = new Subject<string>();

  // Filtros envios
  busquedaEnvios = '';
  busquedaEnviosSubject = new Subject<string>();

  columnasLecturas = ['id_lectura', 'nombre_producto', 'codigo_leido', 'tipo_evento', 'id_dispositivo', 'id_envio', 'fecha_lectura'];
  columnasEnvios = ['id_envio', 'id_pedido', 'cliente', 'nombre_producto', 'codigo_barras', 'cantidad', 'estado_envio'];

  constructor(private bodegaService: BodegaService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.busquedaLecturasSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.aplicarFiltrosLecturas());
    this.busquedaEnviosSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.aplicarFiltrosEnvios());
    this.cargarLecturas();
    this.cargarEnvios();
  }

  ngOnDestroy(): void {
    this.busquedaLecturasSubject.complete();
    this.busquedaEnviosSubject.complete();
  }

  cargarLecturas(): void {
    this.loadingLecturas = true;
    this.errorLecturas = '';
    this.bodegaService.listarLecturas().subscribe({
      next: (data) => {
        this.todasLecturas = data;
        this.aplicarFiltrosLecturas();
        this.loadingLecturas = false;
      },
      error: () => { this.errorLecturas = 'No se pudieron cargar las lecturas IoT'; this.loadingLecturas = false; }
    });
  }

  cargarEnvios(): void {
    this.loadingEnvios = true;
    this.errorEnvios = '';
    this.bodegaService.listarEnviosPendientes().subscribe({
      next: (data) => {
        this.todosEnvios = data;
        this.aplicarFiltrosEnvios();
        this.loadingEnvios = false;
      },
      error: () => { this.errorEnvios = 'No se pudieron cargar los envios pendientes'; this.loadingEnvios = false; }
    });
  }

  // ── Filtros Lecturas ───────────────────────────────────────────────────────
  aplicarFiltrosLecturas(): void {
    let resultado = this.todasLecturas;
    if (this.filtroTipoEvento) {
      resultado = resultado.filter(l => l.tipo_evento === this.filtroTipoEvento);
    }
    if (this.busquedaLecturas.trim()) {
      const q = this.busquedaLecturas.toLowerCase();
      resultado = resultado.filter(l =>
        l.nombre_producto.toLowerCase().includes(q) ||
        l.codigo_leido.toLowerCase().includes(q)
      );
    }
    this.lecturas = resultado;
    this.lecturasPageIndex = 0;
  }

  limpiarFiltrosLecturas(): void {
    this.busquedaLecturas = '';
    this.filtroTipoEvento = '';
    this.lecturas = this.todasLecturas;
    this.lecturasPageIndex = 0;
  }

  get filtrosLecturasActivos(): boolean {
    return !!this.busquedaLecturas || !!this.filtroTipoEvento;
  }

  // ── Filtros Envios ─────────────────────────────────────────────────────────
  aplicarFiltrosEnvios(): void {
    if (!this.busquedaEnvios.trim()) {
      this.envios = this.todosEnvios;
    } else {
      const q = this.busquedaEnvios.toLowerCase();
      this.envios = this.todosEnvios.filter(e =>
        e.cliente.toLowerCase().includes(q) ||
        e.nombre_producto.toLowerCase().includes(q) ||
        e.codigo_barras.toLowerCase().includes(q)
      );
    }
    this.enviosPageIndex = 0;
  }

  limpiarFiltrosEnvios(): void {
    this.busquedaEnvios = '';
    this.envios = this.todosEnvios;
    this.enviosPageIndex = 0;
  }

  // ── Utilidades ─────────────────────────────────────────────────────────────
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

  getTotalLecturas(): number { return this.todasLecturas.length; }
  getTotalDespachos(): number { return this.todasLecturas.filter(l => l.tipo_evento === 'Despacho').length; }
  getTotalEnviosPendientes(): number { return this.todosEnvios.filter(e => e.estado_envio === 'Pendiente').length; }

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

  cambiarPaginaLecturas(event: PageEvent): void { this.lecturasPageIndex = event.pageIndex; this.lecturasPageSize = event.pageSize; }
  cambiarPaginaEnvios(event: PageEvent): void { this.enviosPageIndex = event.pageIndex; this.enviosPageSize = event.pageSize; }
}

