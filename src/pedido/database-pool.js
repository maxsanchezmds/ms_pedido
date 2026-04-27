const { Injectable } = require('@nestjs/common');
const { Pool } = require('pg');

class DatabasePool {
  constructor() {
    this.pool = new Pool(this.getPoolConfiguration());
  }

  query(text, params) {
    return this.pool.query(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  getPoolConfiguration() {
    if (process.env.DATABASE_URL) {
      return {
        connectionString: process.env.DATABASE_URL,
        ssl: this.shouldUseSsl(),
      };
    }

    return {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT || 5432),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      ssl: this.shouldUseSsl(),
    };
  }

  shouldUseSsl() {
    if (process.env.DATABASE_SSL === 'false') {
      return false;
    }

    if (process.env.DATABASE_SSL === 'true') {
      return { rejectUnauthorized: false };
    }

    const databaseEndpoint = process.env.DATABASE_URL || process.env.DATABASE_HOST || '';
    return databaseEndpoint.includes('.rds.amazonaws.com') ? { rejectUnauthorized: false } : false;
  }
}

Injectable()(DatabasePool);

module.exports = { DatabasePool };
