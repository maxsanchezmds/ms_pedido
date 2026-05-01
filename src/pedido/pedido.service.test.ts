import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PedidoEventPublisher } from './pedido-event-publisher';
import { PedidoRequestValidator } from './pedido-request-validator';
import { PedidoRepository } from './pedido.repository';
import { PedidoService } from './pedido.service';
import { CreatePedidoData, PedidoConTrazabilidad } from './pedido.types';

type PedidoRepositoryMock = jest.Mocked<Pick<PedidoRepository, 'create' | 'update' | 'cancel' | 'findStatusById'>>;
type PedidoEventPublisherMock = jest.Mocked<
  Pick<PedidoEventPublisher, 'publishPedidoCreado' | 'publishPedidoActualizado' | 'publishPedidoCancelado'>
>;

describe('PedidoService', () => {
  const repository: PedidoRepositoryMock = {
    create: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
    findStatusById: jest.fn(),
  };
  const eventPublisher: PedidoEventPublisherMock = {
    publishPedidoCreado: jest.fn(),
    publishPedidoActualizado: jest.fn(),
    publishPedidoCancelado: jest.fn(),
  };
  const requestValidator = new PedidoRequestValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    eventPublisher.publishPedidoCreado.mockResolvedValue(undefined);
    eventPublisher.publishPedidoActualizado.mockResolvedValue(undefined);
    eventPublisher.publishPedidoCancelado.mockResolvedValue(undefined);
  });

  test('crea pedidos con productos y direccion validos', async () => {
    repository.create.mockImplementation((createPedidoData: CreatePedidoData) =>
      Promise.resolve({
        ...createPedidoData.pedido,
        trazabilidad_pedido: {
          nombre_solicitante: createPedidoData.trazabilidadPedido.nombre_solicitante,
          tipo_cargo: createPedidoData.trazabilidadPedido.tipo_cargo,
          empresa: createPedidoData.trazabilidadPedido.empresa,
        },
      } satisfies PedidoConTrazabilidad),
    );
    const service = new PedidoService(repository, eventPublisher, requestValidator);

    const pedido = await service.create({
      productos: [{ id_producto: 'sku-1', cantidad: 2 }],
      direccion_despacho: 'Av. Siempre Viva 123',
      trazabilidad_pedido: {
        nombre_solicitante: 'Ana Perez',
        tipo_cargo: 'Compras',
        empresa: 'Smartlogix',
      },
    });

    expect(pedido.id_pedido).toBeDefined();
    expect(pedido.estado).toBe('creado');
    expect(pedido.fecha_hora).toBeInstanceOf(Date);
    expect(pedido.trazabilidad_pedido).toEqual({
      nombre_solicitante: 'Ana Perez',
      tipo_cargo: 'Compras',
      empresa: 'Smartlogix',
    });
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(eventPublisher.publishPedidoCreado).toHaveBeenCalledWith(pedido);
  });

  test('rechaza productos sin cantidad positiva', async () => {
    const service = new PedidoService(repository, eventPublisher, requestValidator);

    await expect(
      service.create({
        productos: [{ id_producto: 'sku-1', cantidad: 0 }],
        direccion_despacho: 'Av. Siempre Viva 123',
        trazabilidad_pedido: {
          nombre_solicitante: 'Ana Perez',
          tipo_cargo: 'Compras',
          empresa: 'Smartlogix',
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  test('rechaza pedidos sin trazabilidad', async () => {
    const service = new PedidoService(repository, eventPublisher, requestValidator);

    await expect(
      service.create({
        productos: [{ id_producto: 'sku-1', cantidad: 1 }],
        direccion_despacho: 'Av. Siempre Viva 123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  test('rechaza requests sin body con bad request', async () => {
    const service = new PedidoService(repository, eventPublisher, requestValidator);

    await expect(service.create()).rejects.toBeInstanceOf(BadRequestException);
  });

  test('actualiza solo la direccion de despacho', async () => {
    const pedidoActualizado = {
      id_pedido: '7d25ed8e-471e-4d1a-a432-bfccca5cfe4f',
      productos: [{ id_producto: 'sku-1', cantidad: 2 }],
      direccion_despacho: 'Nueva direccion 456',
      estado: 'creado' as const,
      fecha_hora: new Date(),
    };
    repository.update.mockResolvedValue(pedidoActualizado);
    const service = new PedidoService(repository, eventPublisher, requestValidator);

    const pedido = await service.update('7d25ed8e-471e-4d1a-a432-bfccca5cfe4f', {
      direccion_despacho: ' Nueva direccion 456 ',
    });

    expect(pedido).toBe(pedidoActualizado);
    expect(repository.update).toHaveBeenCalledWith('7d25ed8e-471e-4d1a-a432-bfccca5cfe4f', {
      direccion_despacho: 'Nueva direccion 456',
    });
    expect(eventPublisher.publishPedidoActualizado).toHaveBeenCalledWith(pedidoActualizado);
  });

  test('rechaza actualizar productos de un pedido existente', async () => {
    const service = new PedidoService(repository, eventPublisher, requestValidator);

    await expect(
      service.update('7d25ed8e-471e-4d1a-a432-bfccca5cfe4f', {
        productos: [{ id_producto: 'sku-1', cantidad: 3 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
    expect(eventPublisher.publishPedidoActualizado).not.toHaveBeenCalled();
  });

  test('publica evento al cancelar un pedido existente', async () => {
    const pedidoCancelado = {
      id_pedido: '7d25ed8e-471e-4d1a-a432-bfccca5cfe4f',
      productos: [{ id_producto: 'sku-1', cantidad: 2 }],
      direccion_despacho: 'Av. Siempre Viva 123',
      estado: 'cancelado' as const,
      fecha_hora: new Date(),
    };
    repository.cancel.mockResolvedValue(pedidoCancelado);
    const service = new PedidoService(repository, eventPublisher, requestValidator);

    const pedido = await service.cancel('7d25ed8e-471e-4d1a-a432-bfccca5cfe4f');

    expect(pedido).toBe(pedidoCancelado);
    expect(eventPublisher.publishPedidoCancelado).toHaveBeenCalledWith(pedidoCancelado);
  });

  test('retorna not found al cancelar un pedido inexistente', async () => {
    repository.cancel.mockResolvedValue(null);
    const service = new PedidoService(repository, eventPublisher, requestValidator);

    await expect(service.cancel('7d25ed8e-471e-4d1a-a432-bfccca5cfe4f')).rejects.toBeInstanceOf(NotFoundException);
    expect(eventPublisher.publishPedidoCancelado).not.toHaveBeenCalled();
  });
});
