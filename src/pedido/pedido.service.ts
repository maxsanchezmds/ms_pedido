import { randomUUID } from 'node:crypto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PedidoEventPublisher } from './pedido-event-publisher';
import { PedidoRequestValidator } from './pedido-request-validator';
import { PedidoRepository } from './pedido.repository';
import {
  CreatePedidoRequest,
  Pedido,
  PedidoConTrazabilidad,
  PedidoStatus,
  UpdatePedidoRequest,
} from './pedido.types';

type PedidoRepositoryPort = Pick<PedidoRepository, 'create' | 'update' | 'cancel' | 'findStatusById'>;
type PedidoEventPublisherPort = Pick<PedidoEventPublisher, 'publishPedidoCreado'>;

@Injectable()
export class PedidoService {
  constructor(
    @Inject(PedidoRepository) private readonly pedidoRepository: PedidoRepositoryPort,
    @Inject(PedidoEventPublisher) private readonly pedidoEventPublisher: PedidoEventPublisherPort,
    private readonly pedidoRequestValidator: PedidoRequestValidator,
  ) {}

  async create(body: CreatePedidoRequest = {}): Promise<PedidoConTrazabilidad> {
    const createPedidoData = this.pedidoRequestValidator.validateCreateRequest(
      body,
      randomUUID(),
      new Date(),
    );
    const createdPedido = await this.pedidoRepository.create(createPedidoData);
    await this.pedidoEventPublisher.publishPedidoCreado(createdPedido);

    return createdPedido;
  }

  async update(idPedido: string, body: UpdatePedidoRequest = {}): Promise<Pedido> {
    this.pedidoRequestValidator.validateIdPedido(idPedido);
    const fields = this.pedidoRequestValidator.validateUpdateRequest(body);

    const pedido = await this.pedidoRepository.update(idPedido, fields);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    return pedido;
  }

  async cancel(idPedido: string): Promise<Pedido> {
    this.pedidoRequestValidator.validateIdPedido(idPedido);

    const pedido = await this.pedidoRepository.cancel(idPedido);
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    return pedido;
  }

  async getStatus(idPedido: string): Promise<PedidoStatus> {
    this.pedidoRequestValidator.validateIdPedido(idPedido);

    const pedidoStatus = await this.pedidoRepository.findStatusById(idPedido);
    if (!pedidoStatus) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    return pedidoStatus;
  }
}
