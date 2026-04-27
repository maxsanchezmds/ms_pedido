const DEFAULT_SCHEMA = 'public';

function getDatabaseSchema() {
  const schema = process.env.DATABASE_SCHEMA || DEFAULT_SCHEMA;

  if (!/^[a-z][a-z0-9_]*$/.test(schema)) {
    throw new Error('DATABASE_SCHEMA debe comenzar con una letra y usar solo minusculas, numeros o guion bajo.');
  }

  return schema;
}

function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function getPedidosTableName() {
  return `${quoteIdentifier(getDatabaseSchema())}.pedidos`;
}

module.exports = { getDatabaseSchema, getPedidosTableName };
