require('reflect-metadata');

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');
const { DatabaseInitializer } = require('./pedido/database-initializer');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  const databaseInitializer = app.get(DatabaseInitializer);
  await databaseInitializer.ensureSchema();

  const port = Number(process.env.PORT || 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap().catch((error) => {
  console.error('ms_pedido failed to start', error);
  process.exit(1);
});
