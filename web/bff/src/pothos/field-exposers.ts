/**
 * Helpers that expose Prisma model fields in a consistent way for GraphQL
 * (e.g. BigInt id as ID, Date fields as Unix seconds).
 */

export function exposeID<T>(
  t: {
    field: (config: {
      type: 'ID'
      resolve: (parent: { id: bigint }) => string
    }) => T
  },
): T {
  return t.field({
    type: 'ID',
    resolve: (parent) => String(parent.id),
  })
}

/** Expose a Date field as Unix timestamp in seconds. */
export function exposeTime<T, K extends string>(
  t: { int: (config: { resolve: (parent: Record<K, Date>) => number }) => T },
  fieldName: K,
): T {
  return t.int({
    resolve: (parent) =>
      Math.floor((parent[fieldName] as Date).getTime() / 1000),
  })
}
