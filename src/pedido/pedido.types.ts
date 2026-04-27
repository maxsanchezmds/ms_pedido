export type PedidoEstado = 'creado' | 'cancelado';

export interface PedidoProducto {
  id_producto: string;
  cantidad: number;
}

export interface Pedido {
  id_pedido: string;
  productos: PedidoProducto[];
  direccion_despacho: string;
  estado: PedidoEstado;
}

export type PedidoUpdateFields = Partial<Pick<Pedido, 'productos' | 'direccion_despacho'>>;

export type PedidoStatus = Pick<Pedido, 'id_pedido' | 'estado'>;

export interface CreatePedidoRequest {
  productos?: unknown;
  direccion_despacho?: unknown;
}

export interface UpdatePedidoRequest {
  productos?: unknown;
  direccion_despacho?: unknown;
}
