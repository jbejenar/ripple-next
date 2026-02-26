// Typed event catalog — discriminated unions for all domain events

export interface UserCreatedEvent {
  type: 'UserCreated'
  source: 'app.users'
  data: {
    userId: string
    email: string
    name: string
    role: string
    createdAt: string
  }
}

export interface UserUpdatedEvent {
  type: 'UserUpdated'
  source: 'app.users'
  data: {
    userId: string
    changes: Record<string, unknown>
    updatedAt: string
  }
}

export interface ProjectCreatedEvent {
  type: 'ProjectCreated'
  source: 'app.projects'
  data: {
    projectId: string
    name: string
    slug: string
    ownerId: string
    createdAt: string
  }
}

export interface ProjectPublishedEvent {
  type: 'ProjectPublished'
  source: 'app.projects'
  data: {
    projectId: string
    publishedAt: string
  }
}

export type DomainEvent =
  | UserCreatedEvent
  | UserUpdatedEvent
  | ProjectCreatedEvent
  | ProjectPublishedEvent

export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void>

export interface EventBus {
  publish(event: DomainEvent): Promise<void>
  subscribe<T extends DomainEvent>(eventType: T['type'], handler: EventHandler<T>): void
}
