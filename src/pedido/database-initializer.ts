import { Injectable } from '@nestjs/common';
import { DatabasePool } from './database-pool';
import { getDatabaseSchema, getPedidosTableName, quoteIdentifier } from './database-schema';

@Injectable()
export class DatabaseInitializer {
  constructor(private readonly databasePool: DatabasePool) {}

  async ensureSchema(): Promise<void> {
    const schema = getDatabaseSchema();
    const tableName = getPedidosTableName();

    await this.databasePool.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdentifier(schema)}`);
    await this.databasePool.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id_pedido UUID PRIMARY KEY,
        productos JSONB NOT NULL,
        direccion_despacho TEXT NOT NULL,
        estado VARCHAR(20) NOT NULL CHECK (estado IN ('creado', 'cancelado'))
      )
    `);
  }
}
