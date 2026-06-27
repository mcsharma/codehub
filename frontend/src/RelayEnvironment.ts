
import {
  Environment,
  Network,
  RecordSource,
  Store,
} from 'relay-runtime';

import type { FetchFunction } from 'relay-runtime';

const fetchFn: FetchFunction = async (request, variables) => {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: request.text,
      variables,
    }),
  });

  return await response.json();
};

export const RelayEnv = new Environment({
  network: Network.create(fetchFn),
  store: new Store(new RecordSource()),
});
