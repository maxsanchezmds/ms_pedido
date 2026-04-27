import { Injectable } from '@nestjs/common';
import { DatabasePool } from './database-pool';
import { getPedidosTableName } from './database-schema';
import { Pedido, PedidoStatus, PedidoUpdateFields } from './pedido.types';

@Injectable()
export class PedidoRepository {
  private readonly tableName: string;

  constructor(private readonly databasePool: DatabasePool) {
    this.tableName = getPedidosTableName();
  }

  async create(pedido: Pedido): Promise<Pedido> {
    const result = await this.databasePool.query<Pedido>(
      `
        INSERT INTO ${this.tableName} (id_pedido, productos, direccion_despacho, estado)
        VALUES ($1, $2::jsonb, $3, $4)
        RETURNING id_pedido, productos, direccion_despacho, estado
      `,
      [pedido.id_pedido, JSON.stringify(pedido.productos), pedido.direccion_despacho, pedido.estado],
    );

    return result.rows[0] as Pedido;
  }

  async update(idPedido: string, fields: PedidoUpdateFields): Promise<Pedido | null> {
    const assignments: string[] = [];
    const values: unknown[] = [];

    if (fields.productos !== undefined) {
      values.push(JSON.stringify(fields.productos));
      assignments.push(`productos = $${values.length}::jsonb`);
    }

    if (fields.direccion_despacho !== undefined) {
      values.push(fields.direccion_despacho);
      assignments.push(`direccion_despacho = $${values.length}`);
    }

    values.push(idPedido);

    const result = await this.databasePool.query<Pedido>(
      `
        UPDATE ${this.tableName}
        SET ${assignments.join(', ')}
        WHERE id_pedido = $${values.length}
        RETURNING id_pedido, productos, direccion_despacho, estado
      `,
      values,
    );

    return result.rows[0] ?? null;
  }

  async cancel(idPedido: string): Promise<Pedido | null> {
    const result = await this.databasePool.query<Pedido>(
      `
        UPDATE ${this.tableName}
        SET estado = 'cancelado'
        WHERE id_pedido = $1
        RETURNING id_pedido, productos, direccion_despacho, estado
      `,
      [idPedido],
    );

    return result.rows[0] ?? null;
  }

  async findStatusById(idPedido: string): Promise<PedidoStatus | null> {
    const result = await this.databasePool.query<PedidoStatus>(
      `SELECT id_pedido, estado FROM ${this.tableName} WHERE id_pedido = $1`,
      [idPedido],
    );

    return result.rows[0] ?? null;
  }
}
