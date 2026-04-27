const { Inject, Injectable } = require('@nestjs/common');
const { DatabasePool } = require('./database-pool');
const { getPedidosTableName } = require('./database-schema');

class PedidoRepository {
  constructor(databasePool) {
    this.databasePool = databasePool;
    this.tableName = getPedidosTableName();
  }

  async create(pedido) {
    const result = await this.databasePool.query(
      `
        INSERT INTO ${this.tableName} (id_pedido, productos, direccion_despacho, estado)
        VALUES ($1, $2::jsonb, $3, $4)
        RETURNING id_pedido, productos, direccion_despacho, estado
      `,
      [pedido.id_pedido, JSON.stringify(pedido.productos), pedido.direccion_despacho, pedido.estado],
    );

    return result.rows[0];
  }

  async update(idPedido, fields) {
    const assignments = [];
    const values = [];

    if (fields.productos !== undefined) {
      values.push(JSON.stringify(fields.productos));
      assignments.push(`productos = $${values.length}::jsonb`);
    }

    if (fields.direccion_despacho !== undefined) {
      values.push(fields.direccion_despacho);
      assignments.push(`direccion_despacho = $${values.length}`);
    }

    values.push(idPedido);

    const result = await this.databasePool.query(
      `
        UPDATE ${this.tableName}
        SET ${assignments.join(', ')}
        WHERE id_pedido = $${values.length}
        RETURNING id_pedido, productos, direccion_despacho, estado
      `,
      values,
    );

    return result.rows[0] || null;
  }

  async cancel(idPedido) {
    const result = await this.databasePool.query(
      `
        UPDATE ${this.tableName}
        SET estado = 'cancelado'
        WHERE id_pedido = $1
        RETURNING id_pedido, productos, direccion_despacho, estado
      `,
      [idPedido],
    );

    return result.rows[0] || null;
  }

  async findStatusById(idPedido) {
    const result = await this.databasePool.query(
      `SELECT id_pedido, estado FROM ${this.tableName} WHERE id_pedido = $1`,
      [idPedido],
    );

    return result.rows[0] || null;
  }
}

Injectable()(PedidoRepository);
Inject(DatabasePool)(PedidoRepository, undefined, 0);

module.exports = { PedidoRepository };
