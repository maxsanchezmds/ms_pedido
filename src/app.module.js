const { Module } = require('@nestjs/common');
const { HealthController } = require('./health.controller');
const { PedidoController } = require('./pedido/pedido.controller');
const { PedidoRepository } = require('./pedido/pedido.repository');
const { PedidoService } = require('./pedido/pedido.service');
const { DatabasePool } = require('./pedido/database-pool');
const { DatabaseInitializer } = require('./pedido/database-initializer');

class AppModule {}

Module({
  controllers: [HealthController, PedidoController],
  providers: [DatabasePool, DatabaseInitializer, PedidoRepository, PedidoService],
})(AppModule);

module.exports = { AppModule };
