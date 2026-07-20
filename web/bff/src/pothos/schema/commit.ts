import { builder } from '@bff/pothos/builder.js'
import { exposeID, exposeTime } from '@bff/pothos/field-exposers.js'

// --- Commit object type ---

builder.prismaObject('Commit', {
  name: 'Commit',
  fields: (t) => ({
    id: exposeID(t),
    created_time: exposeTime(t, 'createdTime'),
    sha: t.exposeString('sha'),
    message: t.exposeString('message', { nullable: true }),
    repository: t.relation('repository'),
    author: t.relation('author'),
  }),
})
