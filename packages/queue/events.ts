// Typed event definitions for queue messages (discriminated unions)

export interface SendEmailEvent {
  type: 'send-email'
  to: string
  template: string
  data: Record<string, unknown>
}

export interface ProcessImageEvent {
  type: 'process-image'
  key: string
  bucket: string
  operations: Array<{
    type: 'resize' | 'crop' | 'optimize'
    width?: number
    height?: number
    quality?: number
  }>
}

export interface NotifyEvent {
  type: 'notify'
  channel: 'push' | 'sms' | 'webhook'
  recipient: string
  message: string
  metadata?: Record<string, unknown>
}

export type QueueEvent = SendEmailEvent | ProcessImageEvent | NotifyEvent
