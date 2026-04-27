const { randomUUID } = require('crypto');
const { BadRequestException, Inject, Injectable, NotFoundException } = require('@nestjs/common');
const { PedidoRepository } = require('./pedido.repository');

class PedidoService {
  constructor(pedidoRepository) {
    this.pedidoRepository = pedidoRepository;
  }

  async create(body = {}) {
    const pedido = {
      id_pedido: randomUUID(),
      productos: this.validateProductos(body.productos),
      direccion_despacho: this.validateDireccionDespacho(body.direccion_despacho),
      estado: 'creado',
    };

    return this.pedidoRepository.create(pedido);
  }

  async update(idPedido, body = {}) {
    this.validateIdPedido(idPedido);

    const fields = {};
    if (body.productos !== undefined) {
      fields.productos = this.validateProductos(body.productos);
    }
    if (body.direccion_despacho !== undefined) {
      fields.direccion_despacho = this.validateDireccionDespacho(body.direccion_despacho);
    }

    if (Object.keys(fields).length === 0) {
      throw new BadRequestException('Debe indicar al menos productos o direccion_despacho para modificar.');
    }

    const pedido = await this.pedidoRepository.update(idPedido, fields);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    return pedido;
  }

  async cancel(idPedido) {
    this.validateIdPedido(idPedido);

    const pedido = await this.pedidoRepository.cancel(idPedido);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    return pedido;
  }

  async getStatus(idPedido) {
    this.validateIdPedido(idPedido);

    const pedidoStatus = await this.pedidoRepository.findStatusById(idPedido);
    if (!pedidoStatus) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    return pedidoStatus;
  }

  validateIdPedido(idPedido) {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(idPedido)) {
      throw new BadRequestException('id_pedido debe ser un UUID valido.');
    }
  }

  validateProductos(productos) {
    if (!Array.isArray(productos) || productos.length === 0) {
      throw new BadRequestException('productos debe ser un arreglo no vacio.');
    }

    return productos.map((producto, index) => this.validateProducto(producto, index));
  }

  validateProducto(producto, index) {
    if (producto === null || typeof producto !== 'object' || Array.isArray(producto)) {
      throw new BadRequestException(`productos[${index}] debe ser un objeto.`);
    }

    const idProducto = producto.id_producto;
    const cantidad = producto.cantidad;

    if (typeof idProducto !== 'string' || idProducto.trim() === '') {
      throw new BadRequestException(`productos[${index}].id_producto debe ser un texto no vacio.`);
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new BadRequestException(`productos[${index}].cantidad debe ser un entero mayor a 0.`);
    }

    return {
      id_producto: idProducto.trim(),
      cantidad,
    };
  }

  validateDireccionDespacho(direccionDespacho) {
    if (typeof direccionDespacho !== 'string' || direccionDespacho.trim() === '') {
      throw new BadRequestException('direccion_despacho debe ser un texto no vacio.');
    }

    return direccionDespacho.trim();
  }
}

Injectable()(PedidoService);
Inject(PedidoRepository)(PedidoService, undefined, 0);

module.exports = { PedidoService };
