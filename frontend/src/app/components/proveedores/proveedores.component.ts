import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ProveedoresService, Proveedor, ProveedorRequest } from '../../services/proveedores.service';

@Component({
  selector: 'app-proveedores',
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
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  loading = true;
  loadingAccion = false;
  error = '';

  modoFormulario: 'ninguno' | 'crear' | 'editar' = 'ninguno';
  proveedorEditando: Proveedor | null = null;

  form: FormGroup;
  displayedColumns = ['id_proveedor', 'razon_social', 'ruc', 'correo', 'telefono', 'contacto_nombre', 'acciones'];

  constructor(
    private proveedoresService: ProveedoresService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      razon_social:    ['', Validators.required],
      ruc:             [''],
      correo:          ['', [Validators.email]],
      telefono:        [''],
      direccion:       [''],
      contacto_nombre: ['']
    });
  }

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

  abrirCrear(): void {
    this.modoFormulario = 'crear';
    this.proveedorEditando = null;
    this.form.reset();
  }

  abrirEditar(prov: Proveedor): void {
    this.modoFormulario = 'editar';
    this.proveedorEditando = prov;
    this.form.patchValue({
      razon_social:    prov.razon_social,
      ruc:             prov.ruc,
      correo:          prov.correo,
      telefono:        prov.telefono,
      direccion:       prov.direccion,
      contacto_nombre: prov.contacto_nombre
    });
  }

  cancelar(): void {
    this.modoFormulario = 'ninguno';
    this.proveedorEditando = null;
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.loadingAccion = true;

    const payload: ProveedorRequest = this.form.value;

    if (this.modoFormulario === 'crear') {
      this.proveedoresService.crear(payload).subscribe({
        next: (nuevo) => {
          this.snackBar.open(`Proveedor "${nuevo.razon_social}" creado`, 'Cerrar', { duration: 3000 });
          this.proveedores = [...this.proveedores, nuevo];
          this.cancelar();
          this.loadingAccion = false;
        },
        error: (err) => {
          this.mostrarError(err?.error?.error || 'Error al crear el proveedor');
          this.loadingAccion = false;
        }
      });
    } else if (this.modoFormulario === 'editar' && this.proveedorEditando) {
      this.proveedoresService.actualizar(this.proveedorEditando.id_proveedor, payload).subscribe({
        next: () => {
          this.snackBar.open('Proveedor actualizado', 'Cerrar', { duration: 3000 });
          this.cancelar();
          this.cargarProveedores();
          this.loadingAccion = false;
        },
        error: (err) => {
          this.mostrarError(err?.error?.error || 'Error al actualizar el proveedor');
          this.loadingAccion = false;
        }
      });
    }
  }

  eliminar(prov: Proveedor): void {
    if (!confirm(`¿Eliminar proveedor "${prov.razon_social}"?\n\nSi tiene órdenes de compra asociadas, se rechazará la eliminación.`)) return;
    this.loadingAccion = true;

    this.proveedoresService.eliminar(prov.id_proveedor).subscribe({
      next: () => {
        this.snackBar.open('Proveedor eliminado', 'Cerrar', { duration: 3000 });
        this.proveedores = this.proveedores.filter(p => p.id_proveedor !== prov.id_proveedor);
        this.loadingAccion = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.error || 'No se pudo eliminar el proveedor');
        this.loadingAccion = false;
      }
    });
  }

  private mostrarError(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'snack-error' });
  }
}
