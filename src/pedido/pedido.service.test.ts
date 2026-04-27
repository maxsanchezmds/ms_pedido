import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PedidoRepository } from './pedido.repository';
import { PedidoService } from './pedido.service';
import { Pedido } from './pedido.types';

type PedidoRepositoryMock = jest.Mocked<Pick<PedidoRepository, 'create' | 'update' | 'cancel' | 'findStatusById'>>;

describe('PedidoService', () => {
  const repository: PedidoRepositoryMock = {
    create: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
    findStatusById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('crea pedidos con productos y direccion validos', async () => {
    repository.create.mockImplementation((pedido: Pedido) => Promise.resolve(pedido));
    const service = new PedidoService(repository);

    const pedido = await service.create({
      productos: [{ id_producto: 'sku-1', cantidad: 2 }],
      direccion_despacho: 'Av. Siempre Viva 123',
    });

    expect(pedido.id_pedido).toBeDefined();
    expect(pedido.estado).toBe('creado');
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  test('rechaza productos sin cantidad positiva', async () => {
    const service = new PedidoService(repository);

    await expect(
      service.create({
        productos: [{ id_producto: 'sku-1', cantidad: 0 }],
        direccion_despacho: 'Av. Siempre Viva 123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  test('rechaza requests sin body con bad request', async () => {
    const service = new PedidoService(repository);

    await expect(service.create()).rejects.toBeInstanceOf(BadRequestException);
  });

  test('retorna not found al cancelar un pedido inexistente', async () => {
    repository.cancel.mockResolvedValue(null);
    const service = new PedidoService(repository);

    await expect(service.cancel('7d25ed8e-471e-4d1a-a432-bfccca5cfe4f')).rejects.toBeInstanceOf(NotFoundException);
  });
});
