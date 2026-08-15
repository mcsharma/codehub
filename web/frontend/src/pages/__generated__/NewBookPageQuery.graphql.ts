/**
 * @generated SignedSource<<251c7c9abf39a272c7e7b5c77af7612d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NewBookPageQuery$variables = Record<PropertyKey, never>;
export type NewBookPageQuery$data = {
  readonly authors: ReadonlyArray<{
    readonly id: string | null | undefined;
    readonly name: string | null | undefined;
  }> | null | undefined;
  readonly current_user: {
    readonly username: string | null | undefined;
  } | null | undefined;
  readonly publishers: ReadonlyArray<{
    readonly id: string | null | undefined;
    readonly name: string | null | undefined;
  }> | null | undefined;
};
export type NewBookPageQuery = {
  response: NewBookPageQuery$data;
  variables: NewBookPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  (v1/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "Publisher",
  "kind": "LinkedField",
  "name": "publishers",
  "plural": true,
  "selections": (v2/*: any*/),
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "Author",
  "kind": "LinkedField",
  "name": "authors",
  "plural": true,
  "selections": (v2/*: any*/),
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "NewBookPageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "current_user",
        "plural": false,
        "selections": [
          (v0/*: any*/)
        ],
        "storageKey": null
      },
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "NewBookPageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "current_user",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      (v3/*: any*/),
      (v4/*: any*/)
    ]
  },
  "params": {
    "cacheID": "d78b9824a896f686402e6d5cb3567fdd",
    "id": null,
    "metadata": {},
    "name": "NewBookPageQuery",
    "operationKind": "query",
    "text": "query NewBookPageQuery {\n  current_user {\n    username\n    id\n  }\n  publishers {\n    id\n    name\n  }\n  authors {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "357c17f602907ec6b27371b0366213df";

export default node;
