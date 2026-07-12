import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

export interface Marca {
  id_marca: number;
  nombre_marca: string;
}

export interface Producto {
  id_producto: number;
  id_categoria: number;
  nombre_categoria: string;
  id_marca: number;
  nombre_marca: string;
  nombre_producto: string;
  descripcion: string;
  precio_unitario: number;
  codigo_barras: string;
  activo: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  ubicacion_bodega: string;
}

export interface ProductoCreateRequest {
  id_categoria: number;
  id_marca: number;
  nombre_producto: string;
  descripcion: string;
  precio_unitario: number;
  codigo_barras: string;
  stock_inicial: number;
  stock_minimo: number;
  stock_maximo: number;
  ubicacion_bodega: string;
}

export interface ProductoUpdateRequest {
  id_categoria: number;
  id_marca: number;
  nombre_producto: string;
  descripcion: string;
  precio_unitario: number;
  codigo_barras: string;
  stock_minimo: number;
  stock_maximo: number;
  ubicacion_bodega: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(private api: ApiService) {}

  listar(): Observable<Producto[]> {
    return this.api.get<Producto[]>('/productos');
  }

  listarCategorias(): Observable<Categoria[]> {
    return this.api.get<Categoria[]>('/categorias');
  }

  listarMarcas(): Observable<Marca[]> {
    return this.api.get<Marca[]>('/marcas');
  }

  crear(payload: ProductoCreateRequest): Observable<{ mensaje: string; id_producto: number }> {
    return this.api.post<{ mensaje: string; id_producto: number }>('/productos', payload);
  }

  actualizar(id: number, payload: ProductoUpdateRequest): Observable<{ mensaje: string }> {
    return this.api.put<{ mensaje: string }>(`/productos/${id}`, payload);
  }

  desactivar(id: number): Observable<{ mensaje: string }> {
    return this.api.delete<{ mensaje: string }>(`/productos/${id}`);
  }
}
