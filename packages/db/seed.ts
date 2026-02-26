import { createDatabase } from './client'
import { users, projects } from './schema'

async function seed(): Promise<void> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required')
  }

  const db = createDatabase(connectionString)
  console.log('Seeding database...')

  // Seed users
  const [adminUser] = await db
    .insert(users)
    .values([
      {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'user@example.com',
        name: 'Test User',
        role: 'user'
      }
    ])
    .returning()

  // Seed projects
  await db.insert(projects).values([
    {
      name: 'Sample Project',
      description: 'A sample project for development',
      slug: 'sample-project',
      ownerId: adminUser.id,
      status: 'published'
    }
  ])

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
