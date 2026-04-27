import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DatabaseInitializer } from './pedido/database-initializer';
import { DatabasePool } from './pedido/database-pool';
import { PedidoController } from './pedido/pedido.controller';
import { PedidoRepository } from './pedido/pedido.repository';
import { PedidoService } from './pedido/pedido.service';

@Module({
  controllers: [HealthController, PedidoController],
  providers: [DatabasePool, DatabaseInitializer, PedidoRepository, PedidoService],
})
export class AppModule {}
