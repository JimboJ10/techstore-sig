import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Proveedor {
  id_proveedor: number;
  razon_social: string;
  ruc: string;
  correo: string;
  telefono: string;
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
}
