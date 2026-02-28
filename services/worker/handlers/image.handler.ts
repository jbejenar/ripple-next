import type { SQSEvent, SQSHandler } from 'aws-lambda'
import type { ProcessImageEvent } from '@ripple/queue'
import type { StorageProvider } from '@ripple/storage'

interface ImageHandlerDeps {
  storageProvider: StorageProvider
}

/**
 * Lambda handler for processing image queue messages.
 * Triggered by SQS events.
 */
export function createImageHandler(deps: ImageHandlerDeps): (event: SQSEvent) => Promise<void> {
  return async (event: SQSEvent) => {
    for (const record of event.Records) {
      const message: ProcessImageEvent = JSON.parse(record.body)

      // Download the source image
      const imageBuffer = await deps.storageProvider.download(message.key)

      // Process operations (resize, crop, optimize)
      for (const op of message.operations) {
        console.log(`Processing ${op.type} for ${message.key}`, {
          width: op.width,
          height: op.height,
          quality: op.quality
        })
      }

      // Upload processed image
      const processedKey = `processed/${message.key}`
      await deps.storageProvider.upload(processedKey, imageBuffer, {
        contentType: 'image/webp'
      })
    }
  }
}

// Default export for SST Lambda handler
export const handler: SQSHandler = async (event) => {
  const { S3StorageProvider } = await import('@ripple/storage')
  const storageProvider = new S3StorageProvider('uploads')

  const imageHandler = createImageHandler({ storageProvider })
  await imageHandler(event)
}
