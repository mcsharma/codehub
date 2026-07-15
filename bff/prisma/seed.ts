/// <reference types="node" />
import 'dotenv/config'
import { PrismaClient, RepositoryVisibility } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.$transaction(async (tx) => {
    // Clean slate (order matters for FK constraints)
    await tx.commit.deleteMany()
    await tx.repository.deleteMany()
    await tx.modelUser.deleteMany()
    await tx.modelOrganization.deleteMany()

    // ── Organizations ──────────────────────────────────────────────
    const coderCo = await tx.modelOrganization.create({
      data: {
        name: 'coder-co',
        data: { description: 'The developer company', website: 'https://coder.co' },
      },
    })

    const openSourceCollective = await tx.modelOrganization.create({
      data: {
        name: 'open-source-collective',
        data: { description: 'Community-driven open source projects', website: 'https://osc.dev' },
      },
    })

    // ── Users ──────────────────────────────────────────────────────
    const alice = await tx.modelUser.create({
      data: {
        username: 'alice',
        data: { email: 'alice@codehub.dev', first_name: 'Alice', last_name: 'Chen', bio: 'Full-stack engineer' },
        adminOfOrganizations: { connect: [{ id: coderCo.id }] },
      },
    })

    const bob = await tx.modelUser.create({
      data: {
        username: 'bob',
        data: { email: 'bob@codehub.dev', first_name: 'Bob', last_name: 'Martinez', bio: 'Backend specialist' },
        adminOfOrganizations: { connect: [{ id: coderCo.id }, { id: openSourceCollective.id }] },
      },
    })

    const carol = await tx.modelUser.create({
      data: {
        username: 'carol',
        data: { email: 'carol@codehub.dev', first_name: 'Carol', last_name: 'Nguyen', bio: 'DevOps & infra' },
        adminOfOrganizations: { connect: [{ id: openSourceCollective.id }] },
      },
    })

    const dave = await tx.modelUser.create({
      data: {
        username: 'dave',
        data: { email: 'dave@codehub.dev', first_name: 'Dave', last_name: 'Kim', bio: 'Frontend developer' },
      },
    })

    // ── User-owned repositories ────────────────────────────────────
    const myApp = await tx.repository.create({
      data: {
        name: 'my-app',
        visibility: RepositoryVisibility.PUBLIC,
        ownerUser: { connect: { id: alice.id } },
        admins: { connect: [{ id: alice.id }, { id: bob.id }] },
      },
    })

    const privateLib = await tx.repository.create({
      data: {
        name: 'private-lib',
        visibility: RepositoryVisibility.PRIVATE,
        ownerUser: { connect: { id: alice.id } },
        admins: { connect: [{ id: alice.id }] },
      },
    })

    const dotfiles = await tx.repository.create({
      data: {
        name: 'dotfiles',
        visibility: RepositoryVisibility.PUBLIC,
        ownerUser: { connect: { id: bob.id } },
        admins: { connect: [{ id: bob.id }] },
      },
    })

    // ── Org-owned repositories ─────────────────────────────────────
    const sharedPlatform = await tx.repository.create({
      data: {
        name: 'shared-platform',
        visibility: RepositoryVisibility.PUBLIC,
        ownerOrganization: { connect: { id: coderCo.id } },
        admins: { connect: [{ id: alice.id }, { id: bob.id }, { id: carol.id }] },
      },
    })

    const designSystem = await tx.repository.create({
      data: {
        name: 'design-system',
        visibility: RepositoryVisibility.PUBLIC,
        ownerOrganization: { connect: { id: coderCo.id } },
        admins: { connect: [{ id: alice.id }, { id: dave.id }] },
      },
    })

    const communityTools = await tx.repository.create({
      data: {
        name: 'community-tools',
        visibility: RepositoryVisibility.PUBLIC,
        ownerOrganization: { connect: { id: openSourceCollective.id } },
        admins: { connect: [{ id: bob.id }, { id: carol.id }] },
      },
    })

    // ── Commits ────────────────────────────────────────────────────
    await tx.commit.createMany({
      data: [
        // my-app
        { repositoryId: myApp.id, sha: 'a1b2c3d', message: 'Initial commit', authorId: alice.id },
        { repositoryId: myApp.id, sha: 'e4f5a6b', message: 'Add user authentication', authorId: alice.id },
        { repositoryId: myApp.id, sha: 'c7d8e9f', message: 'Setup CI pipeline', authorId: bob.id },
        { repositoryId: myApp.id, sha: 'f0a1b2c', message: 'Fix login redirect bug', authorId: dave.id },

        // private-lib
        { repositoryId: privateLib.id, sha: '1a2b3c4', message: 'Initial scaffold', authorId: alice.id },
        { repositoryId: privateLib.id, sha: '5d6e7f8', message: 'Add encryption helpers', authorId: alice.id },

        // dotfiles
        { repositoryId: dotfiles.id, sha: '9a0b1c2', message: 'Add zsh config', authorId: bob.id },
        { repositoryId: dotfiles.id, sha: 'd3e4f5a', message: 'Add tmux config', authorId: bob.id },
        { repositoryId: dotfiles.id, sha: 'b6c7d8e', message: 'Add neovim setup', authorId: bob.id },

        // shared-platform
        { repositoryId: sharedPlatform.id, sha: 'sp00001', message: 'Bootstrap monorepo', authorId: alice.id },
        { repositoryId: sharedPlatform.id, sha: 'sp00002', message: 'Add shared auth module', authorId: bob.id },
        { repositoryId: sharedPlatform.id, sha: 'sp00003', message: 'Add API gateway', authorId: carol.id },
        { repositoryId: sharedPlatform.id, sha: 'sp00004', message: 'Add rate limiting middleware', authorId: bob.id },

        // design-system
        { repositoryId: designSystem.id, sha: 'ds00001', message: 'Init Storybook', authorId: dave.id },
        { repositoryId: designSystem.id, sha: 'ds00002', message: 'Add Button component', authorId: dave.id },
        { repositoryId: designSystem.id, sha: 'ds00003', message: 'Add theme tokens', authorId: alice.id },

        // community-tools
        { repositoryId: communityTools.id, sha: 'ct00001', message: 'Add CLI scaffolder', authorId: carol.id },
        { repositoryId: communityTools.id, sha: 'ct00002', message: 'Add linter plugin', authorId: bob.id },
      ],
    })

    console.log('Seed complete ✓')
    console.log(`  Organizations: 2  |  Users: 4  |  Repositories: 6  |  Commits: 18`)
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })

