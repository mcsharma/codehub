/**
 * @generated SignedSource<<e993485db142f0c186c3634c139172f2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NewRepoPageQuery$variables = Record<PropertyKey, never>;
export type NewRepoPageQuery$data = {
  readonly current_user: {
    readonly username: string | null | undefined;
  } | null | undefined;
};
export type NewRepoPageQuery = {
  response: NewRepoPageQuery$data;
  variables: NewRepoPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "NewRepoPageQuery",
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
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "NewRepoPageQuery",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ab76e171f408a5faea72c8a4d0117d4b",
    "id": null,
    "metadata": {},
    "name": "NewRepoPageQuery",
    "operationKind": "query",
    "text": "query NewRepoPageQuery {\n  current_user {\n    username\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "8ca7729fe890425b348011d8e30b3192";

export default node;
