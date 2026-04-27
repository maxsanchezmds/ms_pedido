const { DatabasePool } = require('./pedido/database-pool');
const { getDatabaseSchema } = require('./pedido/database-schema');

async function dropPreviewSchema() {
  const schema = getDatabaseSchema();
  if (!schema.startsWith('pr_')) {
    throw new Error(`No se puede eliminar el schema no efimero '${schema}'.`);
  }

  const databasePool = new DatabasePool();
  await databasePool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await databasePool.onModuleDestroy();
  console.log(`Dropped preview schema ${schema}`);
}

dropPreviewSchema().catch((error) => {
  console.error(error);
  process.exit(1);
});
