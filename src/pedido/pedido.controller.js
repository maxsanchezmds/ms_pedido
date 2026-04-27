const { Body, Controller, Get, Inject, Param, Patch, Post } = require('@nestjs/common');
const { PedidoService } = require('./pedido.service');

class PedidoController {
  constructor(pedidoService) {
    this.pedidoService = pedidoService;
  }

  create(body) {
    return this.pedidoService.create(body);
  }

  update(idPedido, body) {
    return this.pedidoService.update(idPedido, body);
  }

  cancel(idPedido) {
    return this.pedidoService.cancel(idPedido);
  }

  getStatus(idPedido) {
    return this.pedidoService.getStatus(idPedido);
  }
}

Controller('api/pedidos')(PedidoController);
Inject(PedidoService)(PedidoController, undefined, 0);

Post()(PedidoController.prototype, 'create', Object.getOwnPropertyDescriptor(PedidoController.prototype, 'create'));
Body()(PedidoController.prototype, 'create', 0);

Patch(':id_pedido')(PedidoController.prototype, 'update', Object.getOwnPropertyDescriptor(PedidoController.prototype, 'update'));
Param('id_pedido')(PedidoController.prototype, 'update', 0);
Body()(PedidoController.prototype, 'update', 1);

Patch(':id_pedido/cancelar')(PedidoController.prototype, 'cancel', Object.getOwnPropertyDescriptor(PedidoController.prototype, 'cancel'));
Param('id_pedido')(PedidoController.prototype, 'cancel', 0);

Get(':id_pedido/estado')(PedidoController.prototype, 'getStatus', Object.getOwnPropertyDescriptor(PedidoController.prototype, 'getStatus'));
Param('id_pedido')(PedidoController.prototype, 'getStatus', 0);

module.exports = { PedidoController };
