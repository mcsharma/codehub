import SchemaBuilder from '@pothos/core'
import RelayPlugin from '@pothos/plugin-relay'
import PrismaPlugin from '@pothos/plugin-prisma'
import type PrismaTypes from '@bff/__generated__/pothos-prisma-types.js'
import { getDatamodel } from '@bff/__generated__/pothos-prisma-types.js'
import { prisma } from '@bff/prisma/db.js'
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

