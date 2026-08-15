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
    // Clean slate (order matters for FK constraints)
    await tx.favorite.deleteMany()
    await tx.book.deleteMany()
    await tx.author.deleteMany()
    await tx.publisher.deleteMany()
    await tx.modelUser.deleteMany()

    // ── Users ──────────────────────────────────────────────────────
    const alice = await tx.modelUser.create({
      data: { username: 'alice', data: { email: 'alice@example.com', first_name: 'Alice' } },
    })
    const bob = await tx.modelUser.create({
      data: { username: 'bob', data: { email: 'bob@example.com', first_name: 'Bob' } },
    })

    // ── Publishers ─────────────────────────────────────────────────
    const fernPress = await tx.publisher.create({ data: { name: 'Fern Press' } })
    const northwind = await tx.publisher.create({ data: { name: 'Northwind Books' } })
    const cobalt = await tx.publisher.create({ data: { name: 'Cobalt & Co.' } })

    // ── Authors ────────────────────────────────────────────────────
    const ursula = await tx.author.create({
      data: { name: 'Ursula Vance', bio: 'Writes about distributed systems and the people who build them.' },
    })
    const miles = await tx.author.create({
      data: { name: 'Miles Okafor', bio: 'Historian turned novelist.' },
    })
    const priya = await tx.author.create({
      data: { name: 'Priya Ramanathan', bio: 'Essayist and short-story writer.' },
    })
    const tobias = await tx.author.create({
      data: { name: 'Tobias Lund', bio: 'Debut novelist, previously a woodworker.' },
    })

    // ── Books (some multi-author, to exercise the Book<->Author
    // many-to-many; publisher is a plain many-to-one) ────────────────
    const distributedDreams = await tx.book.create({
      data: {
        title: 'Distributed Dreams',
        publicationYear: 2021,
        publisher: { connect: { id: fernPress.id } },
        authors: { connect: [{ id: ursula.id }] },
      },
    })
    const theLongCommit = await tx.book.create({
      data: {
        title: 'The Long Commit',
        publicationYear: 2023,
        publisher: { connect: { id: fernPress.id } },
        authors: { connect: [{ id: ursula.id }, { id: priya.id }] },
      },
    })
    const embersOfEmpire = await tx.book.create({
      data: {
        title: 'Embers of Empire',
        publicationYear: 2019,
        publisher: { connect: { id: northwind.id } },
        authors: { connect: [{ id: miles.id }] },
      },
    })
    const quietHarbors = await tx.book.create({
      data: {
        title: 'Quiet Harbors',
        publicationYear: 2022,
        publisher: { connect: { id: northwind.id } },
        authors: { connect: [{ id: priya.id }] },
      },
    })
    const theJoiner = await tx.book.create({
      data: {
        title: 'The Joiner',
        publicationYear: 2024,
        publisher: { connect: { id: cobalt.id } },
        authors: { connect: [{ id: tobias.id }] },
      },
    })
    const fieldNotes = await tx.book.create({
      data: {
        title: 'Field Notes on Everything',
        publicationYear: 2020,
        publisher: { connect: { id: cobalt.id } },
        authors: { connect: [{ id: miles.id }, { id: tobias.id }] },
      },
    })

    // ── Favorites ──────────────────────────────────────────────────
    await tx.favorite.create({ data: { user: { connect: { id: alice.id } }, book: { connect: { id: theLongCommit.id } } } })
    await tx.favorite.create({ data: { user: { connect: { id: alice.id } }, book: { connect: { id: theJoiner.id } } } })
    await tx.favorite.create({ data: { user: { connect: { id: bob.id } }, book: { connect: { id: distributedDreams.id } } } })

    console.log('Seed complete ✓')
    console.log('  Users: 2  |  Publishers: 3  |  Authors: 4  |  Books: 6  |  Favorites: 3')
  }, { timeout: 20000 })
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
