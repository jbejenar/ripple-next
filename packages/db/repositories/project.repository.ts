import { eq } from 'drizzle-orm'
import type { Database } from '../client'
import { projects, type Project, type NewProject } from '../schema'

export class ProjectRepository {
  constructor(private db: Database) {}

  async create(data: NewProject): Promise<Project> {
    const [project] = await this.db.insert(projects).values(data).returning()
    return project!
  }

  async findById(id: string): Promise<Project | undefined> {
    const [project] = await this.db.select().from(projects).where(eq(projects.id, id))
    return project
  }

  async findBySlug(slug: string): Promise<Project | undefined> {
    const [project] = await this.db.select().from(projects).where(eq(projects.slug, slug))
    return project
  }

  async listByOwner(ownerId: string): Promise<Project[]> {
    return this.db.select().from(projects).where(eq(projects.ownerId, ownerId))
  }

  async update(id: string, data: Partial<NewProject>): Promise<Project> {
    const [project] = await this.db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning()
    return project!
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(projects).where(eq(projects.id, id))
  }
}
