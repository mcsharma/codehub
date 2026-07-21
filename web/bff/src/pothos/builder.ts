import SchemaBuilder from '@pothos/core'
import RelayPlugin from '@pothos/plugin-relay'
import PrismaPlugin from '@pothos/plugin-prisma'
import type PrismaTypes from '../__generated__/pothos-prisma-types.js'
import { getDatamodel } from '../__generated__/pothos-prisma-types.js'
import { prisma } from '../prisma/db.js'
import type { Request } from 'express'

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Context: { prisma: typeof prisma; req: Request }
}>({
  plugins: [RelayPlugin, PrismaPlugin],
  relay: {
    clientMutationId: 'required',
    cursorType: 'ID',
  },
  prisma: {
    client: prisma,
    dmmf: getDatamodel(),
  },
})

builder.queryType({})
builder.mutationType({})

