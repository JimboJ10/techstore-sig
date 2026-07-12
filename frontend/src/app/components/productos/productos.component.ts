import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import {
  ProductosService, Producto, Categoria, Marca,
  ProductoCreateRequest, ProductoUpdateRequest
} from '../../services/productos.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  marcas: Marca[] = [];

  loading = true;
  loadingAccion = false;
  error = '';

  modoFormulario: 'ninguno' | 'crear' | 'editar' = 'ninguno';
  productoEditando: Producto | null = null;

  crearForm: FormGroup;
  editarForm: FormGroup;

  displayedColumns = [
    'id_producto', 'nombre_producto', 'categoria', 'marca',
    'precio_unitario', 'stock_actual', 'stock_minimo', 'ubicacion_bodega', 'acciones'
  ];

  constructor(
    private productosService: ProductosService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.crearForm = this.fb.group({
      id_categoria:    [null, Validators.required],
      id_marca:        [null, Validators.required],
      nombre_producto: ['', Validators.required],
      descripcion:     [''],
      precio_unitario: [null, [Validators.required, Validators.min(0.01)]],
      codigo_barras:   [''],
      stock_inicial:   [0, [Validators.min(0)]],
      stock_minimo:    [5, [Validators.required, Validators.min(0)]],
      stock_maximo:    [100, [Validators.required, Validators.min(1)]],
      ubicacion_bodega:['']
    });

    this.editarForm = this.fb.group({
      id_categoria:    [null, Validators.required],
      id_marca:        [null, Validators.required],
      nombre_producto: ['', Validators.required],
      descripcion:     [''],
      precio_unitario: [null, [Validators.required, Validators.min(0.01)]],
      codigo_barras:   [''],
      stock_minimo:    [5, [Validators.required, Validators.min(0)]],
      stock_maximo:    [100, [Validators.required, Validators.min(1)]],
      ubicacion_bodega:['']
    });
  }

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.loading = true;
    this.error = '';

    this.productosService.listarCategorias().subscribe({ next: (d) => this.categorias = d });
    this.productosService.listarMarcas().subscribe({ next: (d) => this.marcas = d });

    this.productosService.listar().subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos';
        this.loading = false;
      }
    });
  }

  abrirCrear(): void {
    this.modoFormulario = 'crear';
    this.productoEditando = null;
    this.crearForm.reset({ stock_inicial: 0, stock_minimo: 5, stock_maximo: 100 });
  }

  abrirEditar(prod: Producto): void {
    this.modoFormulario = 'editar';
    this.productoEditando = prod;
    this.editarForm.patchValue({
      id_categoria:    prod.id_categoria,
      id_marca:        prod.id_marca,
      nombre_producto: prod.nombre_producto,
      descripcion:     prod.descripcion,
      precio_unitario: prod.precio_unitario,
      codigo_barras:   prod.codigo_barras,
      stock_minimo:    prod.stock_minimo,
      stock_maximo:    prod.stock_maximo,
      ubicacion_bodega:prod.ubicacion_bodega
    });
  }

  cancelar(): void {
    this.modoFormulario = 'ninguno';
    this.productoEditando = null;
  }

  crear(): void {
    if (this.crearForm.invalid) return;
    this.loadingAccion = true;

    const payload: ProductoCreateRequest = this.crearForm.value;
    this.productosService.crear(payload).subscribe({
      next: (res) => {
        this.snackBar.open(`Producto creado (ID: ${res.id_producto})`, 'Cerrar', { duration: 3000 });
        this.modoFormulario = 'ninguno';
        this.crearForm.reset({ stock_inicial: 0, stock_minimo: 5, stock_maximo: 100 });
        this.cargarTodo();
        this.loadingAccion = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.error || 'Error al crear el producto');
        this.loadingAccion = false;
      }
    });
  }

  actualizar(): void {
    if (this.editarForm.invalid || !this.productoEditando) return;
    this.loadingAccion = true;

    const payload: ProductoUpdateRequest = this.editarForm.value;
    this.productosService.actualizar(this.productoEditando.id_producto, payload).subscribe({
      next: () => {
        this.snackBar.open('Producto actualizado', 'Cerrar', { duration: 3000 });
        this.modoFormulario = 'ninguno';
        this.productoEditando = null;
        this.cargarTodo();
        this.loadingAccion = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.error || 'Error al actualizar el producto');
        this.loadingAccion = false;
      }
    });
  }

  desactivar(prod: Producto): void {
    if (!confirm(`¿Desactivar "${prod.nombre_producto}" del catálogo? No se eliminan datos históricos.`)) return;
    this.loadingAccion = true;

    this.productosService.desactivar(prod.id_producto).subscribe({
      next: () => {
        this.snackBar.open('Producto desactivado del catálogo', 'Cerrar', { duration: 3000 });
        this.productos = this.productos.filter(p => p.id_producto !== prod.id_producto);
        this.loadingAccion = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.error || 'Error al desactivar el producto');
        this.loadingAccion = false;
      }
    });
  }

  getEstadoStock(prod: Producto): string {
    if (prod.stock_actual === 0) return 'Sin stock';
    if (prod.stock_actual < prod.stock_minimo) return 'Crítico';
    return 'Normal';
  }

  getEstadoColor(prod: Producto): string {
    if (prod.stock_actual === 0) return 'warn';
    if (prod.stock_actual < prod.stock_minimo) return 'warn';
    return 'primary';
  }

  private mostrarError(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 4000, panelClass: 'snack-error' });
  }
}
