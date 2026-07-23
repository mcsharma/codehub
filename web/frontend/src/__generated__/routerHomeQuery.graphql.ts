/**
 * @generated SignedSource<<164c48fcb0822a63289ffd56a96a2028>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type routerHomeQuery$variables = Record<PropertyKey, never>;
export type routerHomeQuery$data = {
  readonly current_user: {
    readonly username: string | null | undefined;
  } | null | undefined;
};
export type routerHomeQuery = {
  response: routerHomeQuery$data;
  variables: routerHomeQuery$variables;
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
    "name": "routerHomeQuery",
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
    "name": "routerHomeQuery",
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
    "cacheID": "95baa18a0ec031e41dc01ea3e55425e9",
    "id": null,
    "metadata": {},
    "name": "routerHomeQuery",
    "operationKind": "query",
    "text": "query routerHomeQuery {\n  current_user {\n    username\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "3254d71331009f6ee51b7a3e6af310f1";

export default node;
