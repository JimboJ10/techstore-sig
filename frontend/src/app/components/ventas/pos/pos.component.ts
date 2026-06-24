import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

interface Producto {
  id_producto: number;
  nombre_producto: string;
  precio_unitario: number;
  codigo_barras: string;
}

interface Cliente {
  id_cliente: number;
  nombres: string;
  apellidos: string;
  correo: string;
}

interface MetodoPago {
  id: number;
  nombre: string;
}

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
  metodosPago: MetodoPago[] = [
    { id: 1, nombre: 'Efectivo' },
    { id: 2, nombre: 'Tarjeta de crédito' },
    { id: 3, nombre: 'Transferencia' }
  ];

  productoSeleccionado: Producto | null = null;
  loading = false;
  subtotal = 0;
  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
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

    this.ventaForm.get('id_producto')?.valueChanges.subscribe(id => {
      this.productoSeleccionado = this.productos.find(p => p.id_producto === id) || null;
      this.calcularSubtotal();
    });

    this.ventaForm.get('cantidad')?.valueChanges.subscribe(() => {
      this.calcularSubtotal();
    });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  cargarProductos(): void {
    this.http.get<Producto[]>(`${this.apiUrl}/productos`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => this.productos = data
    });
  }

  cargarClientes(): void {
    this.http.get<Cliente[]>(`${this.apiUrl}/clientes`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => this.clientes = data
    });
  }

  calcularSubtotal(): void {
    if (this.productoSeleccionado) {
      const cantidad = this.ventaForm.get('cantidad')?.value || 0;
      this.subtotal = this.productoSeleccionado.precio_unitario * cantidad;
    }
  }

  registrarVenta(): void {
    if (this.ventaForm.invalid) return;

    this.loading = true;
    const idEmpleado = 3;

    const payload = {
      ...this.ventaForm.value,
      id_empleado: idEmpleado
    };

    this.http.post<any>(`${this.apiUrl}/ventas`, payload,
      { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.snackBar.open(
          `✅ Venta registrada — Pedido #${res.id_pedido}`,
          'Cerrar',
          { duration: 4000, panelClass: 'snack-success' }
        );
        this.ventaForm.reset({ cantidad: 1 });
        this.productoSeleccionado = null;
        this.subtotal = 0;
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open(
          '❌ Error al registrar la venta',
          'Cerrar',
          { duration: 4000, panelClass: 'snack-error' }
        );
        this.loading = false;
      }
    });
  }
}