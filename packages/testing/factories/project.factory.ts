import { Factory } from 'fishery'

interface ProjectAttrs {
  id: string
  name: string
  description: string
  slug: string
  ownerId: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export const projectFactory = Factory.define<ProjectAttrs>(({ sequence }) => ({
  id: crypto.randomUUID(),
  name: `Project ${sequence}`,
  description: `Description for project ${sequence}`,
  slug: `project-${sequence}`,
  ownerId: crypto.randomUUID(),
  status: 'draft',
  createdAt: new Date(),
  updatedAt: new Date()
}))
