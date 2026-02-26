import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  PurgeQueueCommand
} from '@aws-sdk/client-sqs'
import type { QueueProvider, QueueMessage, SendOptions, ReceiveOptions } from '../types'

/**
 * AWS SQS queue provider for production.
 * Uses SST Resource for queue URLs.
 */
export class SqsQueueProvider implements QueueProvider {
  private client: SQSClient
  private queueUrls: Map<string, string>

  constructor(queueUrls: Record<string, string>, region?: string) {
    this.client = new SQSClient({ region: region ?? 'ap-southeast-2' })
    this.queueUrls = new Map(Object.entries(queueUrls))
  }

  private getUrl(queue: string): string {
    const url = this.queueUrls.get(queue)
    if (!url) {
      throw new Error(`Unknown queue: ${queue}`)
    }
    return url
  }

  async send<T>(queue: string, message: T, options?: SendOptions): Promise<string> {
    const result = await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.getUrl(queue),
        MessageBody: JSON.stringify(message),
        DelaySeconds: options?.delaySeconds,
        MessageDeduplicationId: options?.deduplicationId,
        MessageGroupId: options?.groupId
      })
    )
    return result.MessageId!
  }

  async receive<T>(queue: string, options?: ReceiveOptions): Promise<QueueMessage<T>[]> {
    const result = await this.client.send(
      new ReceiveMessageCommand({
        QueueUrl: this.getUrl(queue),
        MaxNumberOfMessages: options?.maxMessages ?? 10,
        WaitTimeSeconds: options?.waitTimeSeconds ?? 20,
        VisibilityTimeout: options?.visibilityTimeout
      })
    )
    return (result.Messages ?? []).map((msg) => ({
      id: msg.ReceiptHandle!,
      body: JSON.parse(msg.Body!) as T,
      timestamp: new Date(),
      attempts: Number(msg.Attributes?.ApproximateReceiveCount ?? 0)
    }))
  }

  async delete(queue: string, messageId: string): Promise<void> {
    await this.client.send(
      new DeleteMessageCommand({
        QueueUrl: this.getUrl(queue),
        ReceiptHandle: messageId
      })
    )
  }

  async purge(queue: string): Promise<void> {
    await this.client.send(
      new PurgeQueueCommand({
        QueueUrl: this.getUrl(queue)
      })
    )
  }
}
