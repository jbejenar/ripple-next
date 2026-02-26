import { Factory } from 'fishery'

interface UserAttrs {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export const userFactory = Factory.define<UserAttrs>(({ sequence }) => ({
  id: crypto.randomUUID(),
  email: `user-${sequence}@example.com`,
  name: `Test User ${sequence}`,
  role: 'user',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}))
