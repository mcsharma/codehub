/// <reference types="node" />
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.commit.deleteMany()
    await tx.repository.deleteMany()
    await tx.modelUser.deleteMany()

    const alice = await tx.modelUser.create({
      data: {
        username: 'alice',
        data: { email: 'alice@codehub.dev' },
      },
    })
    const bob = await tx.modelUser.create({
      data: {
        username: 'bob',
        data: { email: 'bob@codehub.dev' },
      },
    })

    const repo1 = await tx.repository.create({
      data: {
        name: 'my-app',
        private: false,
        ownerId: alice.id,
        collaborators: { connect: [{ id: bob.id }] },
      },
    })
    await tx.repository.create({
      data: {
        name: 'private-lib',
        private: true,
        ownerId: alice.id,
      },
    })

    await tx.commit.createMany({
      data: [
        { repositoryId: repo1.id, sha: 'abc123', message: 'Initial commit', authorId: alice.id },
        { repositoryId: repo1.id, sha: 'def456', message: 'Add feature', authorId: bob.id },
      ],
    })
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
