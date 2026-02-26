export interface QueueMessage<T = unknown> {
  id: string
  body: T
  timestamp: Date
  attempts: number
}

export interface SendOptions {
  delaySeconds?: number
  deduplicationId?: string
  groupId?: string
}

export interface ReceiveOptions {
  maxMessages?: number
  waitTimeSeconds?: number
  visibilityTimeout?: number
}

export interface QueueProvider {
  send<T>(queue: string, message: T, options?: SendOptions): Promise<string>
  receive<T>(queue: string, options?: ReceiveOptions): Promise<QueueMessage<T>[]>
  delete(queue: string, messageId: string): Promise<void>
  purge(queue: string): Promise<void>
}
