import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Cliente, MetodoPago, Producto, VentasService } from '../../../services/ventas.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit {
  ventaForm: FormGroup;
  productos: Producto[] = [];
  clientes: Cliente[] = [];
  metodosPago: MetodoPago[] = [];

  productoSeleccionado: Producto | null = null;
  loading = false;
  subtotal = 0;

  constructor(
    private fb: FormBuilder,
    private ventasService: VentasService,
    private snackBar: MatSnackBar
  ) {
    this.ventaForm = this.fb.group({
      id_cliente: ['', Validators.required],
      id_producto: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      id_metodo_pago: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarClientes();
    this.cargarMetodosPago();

    this.ventaForm.get('id_producto')?.valueChanges.subscribe(id => {
      this.productoSeleccionado = this.productos.find(p => p.id_producto === id) || null;
      this.calcularSubtotal();
    });

    this.ventaForm.get('cantidad')?.valueChanges.subscribe(() => {
      this.calcularSubtotal();
    });
  }

  cargarProductos(): void {
    this.ventasService.listarProductos().subscribe({
      next: (data) => this.productos = data,
      error: () => this.mostrarError('No se pudieron cargar los productos')
    });
  }

  cargarClientes(): void {
    this.ventasService.listarClientes().subscribe({
      next: (data) => this.clientes = data,
      error: () => this.mostrarError('No se pudieron cargar los clientes')
    });
  }

  cargarMetodosPago(): void {
    this.ventasService.listarMetodosPago().subscribe({
      next: (data) => this.metodosPago = data,
      error: () => this.mostrarError('No se pudieron cargar los metodos de pago')
    });
  }

  calcularSubtotal(): void {
    if (this.productoSeleccionado) {
      const cantidad = this.ventaForm.get('cantidad')?.value || 0;
      this.subtotal = this.productoSeleccionado.precio_unitario * cantidad;
      return;
    }

    this.subtotal = 0;
  }

  registrarVenta(): void {
    if (this.ventaForm.invalid) return;

    this.loading = true;

    this.ventasService.registrarVenta(this.ventaForm.value).subscribe({
      next: (res) => {
        this.snackBar.open(
          `Venta registrada - Pedido #${res.id_pedido}`,
          'Cerrar',
          { duration: 4000, panelClass: 'snack-success' }
        );
        this.ventaForm.reset({ cantidad: 1 });
        this.productoSeleccionado = null;
        this.subtotal = 0;
        this.loading = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.error || 'Error al registrar la venta');
        this.loading = false;
      }
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000, panelClass: 'snack-error' });
  }
}
