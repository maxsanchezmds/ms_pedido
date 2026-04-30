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
  fecha_hora: Date;
}

export interface TrazabilidadPedido {
  id_pedido: string;
  nombre_solicitante: string;
  tipo_cargo: string;
  empresa: string;
}

export interface PedidoConTrazabilidad extends Pedido {
  trazabilidad_pedido: Omit<TrazabilidadPedido, 'id_pedido'>;
}

export type PedidoUpdateFields = Partial<Pick<Pedido, 'productos' | 'direccion_despacho'>>;

export type PedidoStatus = Pick<Pedido, 'id_pedido' | 'estado'>;

export interface CreatePedidoRequest {
  productos?: unknown;
  direccion_despacho?: unknown;
  trazabilidad_pedido?: unknown;
}

export interface UpdatePedidoRequest {
  productos?: unknown;
  direccion_despacho?: unknown;
}

export interface CreatePedidoData {
  pedido: Pedido;
  trazabilidadPedido: TrazabilidadPedido;
}
