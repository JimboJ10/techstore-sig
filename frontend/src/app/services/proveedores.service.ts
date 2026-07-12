import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Proveedor {
  id_proveedor: number;
  razon_social: string;
  ruc: string;
  correo: string;
  telefono: string;
  direccion: string;
  contacto_nombre: string;
}

export interface ProveedorRequest {
  razon_social: string;
  ruc: string;
  correo: string;
  telefono: string;
  direccion: string;
  contacto_nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  constructor(private api: ApiService) {}

  listar(): Observable<Proveedor[]> {
    return this.api.get<Proveedor[]>('/proveedores');
  }

  crear(payload: ProveedorRequest): Observable<Proveedor> {
    return this.api.post<Proveedor>('/proveedores', payload);
  }

  actualizar(id: number, payload: ProveedorRequest): Observable<{ mensaje: string }> {
    return this.api.put<{ mensaje: string }>(`/proveedores/${id}`, payload);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.api.delete<{ mensaje: string }>(`/proveedores/${id}`);
  }
}
