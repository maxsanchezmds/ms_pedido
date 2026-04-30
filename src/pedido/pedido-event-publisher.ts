import { Injectable, Logger } from '@nestjs/common';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { Pedido } from './pedido.types';

export const PEDIDO_CREADO_EVENTO = 'pedido_creado';

@Injectable()
export class PedidoEventPublisher {
  private readonly logger = new Logger(PedidoEventPublisher.name);
  private readonly snsClient = new SNSClient({});
  private readonly topicArn = process.env.EVENTS_TOPIC_ARN?.trim();

  async publishPedidoCreado(pedido: Pedido): Promise<void> {
    if (!this.topicArn) {
      if (process.env.NODE_ENV !== 'test') {
        this.logger.warn('EVENTS_TOPIC_ARN no esta configurado; se omite publicacion de pedido_creado.');
      }
      return;
    }

    await this.snsClient.send(
      new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify({
          evento: PEDIDO_CREADO_EVENTO,
          ocurrido_en: new Date().toISOString(),
          pedido,
        }),
        MessageAttributes: {
          evento: {
            DataType: 'String',
            StringValue: PEDIDO_CREADO_EVENTO,
          },
        },
      }),
    );
  }
}
