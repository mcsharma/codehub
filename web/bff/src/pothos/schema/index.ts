import { builder } from '../builder.js'

// Import all schema modules — each registers its types and queries on the shared builder.
import './user.js'
import './organization.js'
import './repository.js'
import './commit.js'
import './github.js'


// --- Global mutations ---

builder.mutationField('noop', (t) =>
  t.boolean({
    resolve: () => true,
    description: 'No-op mutation for schema compatibility (e.g. Relay).',
  }),
)
