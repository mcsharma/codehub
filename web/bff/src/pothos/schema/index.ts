import { builder } from '../builder.js'

// Import all schema modules — each registers its types and queries on the shared builder.
import './user.js'
import './personal_access_token.js'
import './publisher.js'
import './author.js'
import './book.js'


// --- Global queries/mutations ---

builder.queryField('noop', (t) =>
  t.boolean({
    resolve: () => true,
    description: 'No-op query for schema compatibility (e.g. Relay).',
  }),
)

builder.mutationField('noop', (t) =>
  t.boolean({
    resolve: () => true,
    description: 'No-op mutation for schema compatibility (e.g. Relay).',
  }),
)
