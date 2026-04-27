const { Inject, Injectable } = require('@nestjs/common');
const { DatabasePool } = require('./database-pool');
const { getDatabaseSchema, getPedidosTableName } = require('./database-schema');

class DatabaseInitializer {
  constructor(databasePool) {
    this.databasePool = databasePool;
  }

  async ensureSchema() {
    const schema = getDatabaseSchema();
    const tableName = getPedidosTableName();

    await this.databasePool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
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

Injectable()(DatabaseInitializer);
Inject(DatabasePool)(DatabaseInitializer, undefined, 0);

module.exports = { DatabaseInitializer };
