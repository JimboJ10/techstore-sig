import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Cliente {
  id_cliente: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  direccion: string;
}

export interface PedidoHistorial {
  id_pedido: number;
  fecha_pedido: string;
  estado: string;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  constructor(private api: ApiService) {}

  listar(): Observable<Cliente[]> {
    return this.api.get<Cliente[]>('/clientes');
  }

  crear(cliente: Partial<Cliente>): Observable<Cliente> {
    return this.api.post<Cliente>('/clientes', cliente);
  }

  historial(idCliente: number): Observable<PedidoHistorial[]> {
    return this.api.get<PedidoHistorial[]>(`/clientes/${idCliente}/historial`);
  }
}
