import type { ModelUser } from '@prisma/client'
import { prisma } from '../prisma/db.js'

async function findRepoByOwnerAndName(ownerName: string, repoName: string) {
  const user = await prisma.modelUser.findUnique({ where: { username: ownerName }, select: { id: true } })
  if (user) {
    return prisma.repository.findUnique({
      where: { ownerUserId_name: { ownerUserId: user.id, name: repoName } },
    })
  }

  const org = await prisma.modelOrganization.findUnique({ where: { name: ownerName }, select: { id: true } })
  if (org) {
    return prisma.repository.findUnique({
      where: { ownerOrganizationId_name: { ownerOrganizationId: org.id, name: repoName } },
    })
  }

  return null
}

export async function canAccessRepo(
  user: ModelUser | null,
  ownerName: string,
  repoName: string,
  action: 'read' | 'write',
): Promise<boolean> {
  const repo = await findRepoByOwnerAndName(ownerName, repoName)
  if (!repo) return false

  let isAdmin = false
  if (user) {
    if (repo.ownerUserId === user.id) {
      isAdmin = true
    } else {
      const [repoAdminHit, orgAdminHit] = await Promise.all([
        prisma.repository.count({ where: { id: repo.id, admins: { some: { id: user.id } } } }),
        repo.ownerOrganizationId
          ? prisma.modelOrganization.count({
              where: { id: repo.ownerOrganizationId, admins: { some: { id: user.id } } },
            })
          : Promise.resolve(0),
      ])
      isAdmin = repoAdminHit > 0 || orgAdminHit > 0
    }
  }

  if (action === 'write') return isAdmin
  return repo.visibility === 'PUBLIC' || isAdmin
}
