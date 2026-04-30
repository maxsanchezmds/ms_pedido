import { randomUUID } from 'node:crypto';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PedidoEventPublisher } from './pedido-event-publisher';
import { PedidoRepository } from './pedido.repository';
import {
  CreatePedidoRequest,
  Pedido,
  PedidoProducto,
  PedidoStatus,
  PedidoUpdateFields,
  UpdatePedidoRequest,
} from './pedido.types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PedidoRepositoryPort = Pick<PedidoRepository, 'create' | 'update' | 'cancel' | 'findStatusById'>;
type PedidoEventPublisherPort = Pick<PedidoEventPublisher, 'publishPedidoCreado'>;

@Injectable()
export class PedidoService {
  constructor(
    @Inject(PedidoRepository) private readonly pedidoRepository: PedidoRepositoryPort,
    @Inject(PedidoEventPublisher) private readonly pedidoEventPublisher: PedidoEventPublisherPort,
  ) {}

  async create(body: CreatePedidoRequest = {}): Promise<Pedido> {
    const pedido: Pedido = {
      id_pedido: randomUUID(),
      productos: this.validateProductos(body.productos),
      direccion_despacho: this.validateDireccionDespacho(body.direccion_despacho),
      estado: 'creado',
    };

    const createdPedido = await this.pedidoRepository.create(pedido);
    await this.pedidoEventPublisher.publishPedidoCreado(createdPedido);

    return createdPedido;
  }

  async update(idPedido: string, body: UpdatePedidoRequest = {}): Promise<Pedido> {
    this.validateIdPedido(idPedido);

    const fields: PedidoUpdateFields = {};
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

  async cancel(idPedido: string): Promise<Pedido> {
    this.validateIdPedido(idPedido);

    const pedido = await this.pedidoRepository.cancel(idPedido);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    return pedido;
  }

  async getStatus(idPedido: string): Promise<PedidoStatus> {
    this.validateIdPedido(idPedido);

    const pedidoStatus = await this.pedidoRepository.findStatusById(idPedido);
    if (!pedidoStatus) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    return pedidoStatus;
  }

  private validateIdPedido(idPedido: string): void {
    if (!UUID_PATTERN.test(idPedido)) {
      throw new BadRequestException('id_pedido debe ser un UUID valido.');
    }
  }

  private validateProductos(productos: unknown): PedidoProducto[] {
    if (!Array.isArray(productos) || productos.length === 0) {
      throw new BadRequestException('productos debe ser un arreglo no vacio.');
    }

    return productos.map((producto, index) => this.validateProducto(producto, index));
  }

  private validateProducto(producto: unknown, index: number): PedidoProducto {
    if (producto === null || typeof producto !== 'object' || Array.isArray(producto)) {
      throw new BadRequestException(`productos[${index}] debe ser un objeto.`);
    }

    const candidate = producto as Record<string, unknown>;
    const idProducto = candidate.id_producto;
    const cantidad = candidate.cantidad;

    if (typeof idProducto !== 'string' || idProducto.trim() === '') {
      throw new BadRequestException(`productos[${index}].id_producto debe ser un texto no vacio.`);
    }

    if (typeof cantidad !== 'number' || !Number.isInteger(cantidad) || cantidad <= 0) {
      throw new BadRequestException(`productos[${index}].cantidad debe ser un entero mayor a 0.`);
    }

    return {
      id_producto: idProducto.trim(),
      cantidad,
    };
  }

  private validateDireccionDespacho(direccionDespacho: unknown): string {
    if (typeof direccionDespacho !== 'string' || direccionDespacho.trim() === '') {
      throw new BadRequestException('direccion_despacho debe ser un texto no vacio.');
    }

    return direccionDespacho.trim();
  }
}
