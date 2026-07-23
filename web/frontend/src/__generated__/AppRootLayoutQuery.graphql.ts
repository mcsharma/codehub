/**
 * @generated SignedSource<<f56385415f19ae96bd0162e75da72ba5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AppRootLayoutQuery$variables = Record<PropertyKey, never>;
export type AppRootLayoutQuery$data = {
  readonly current_user: {
    readonly " $fragmentSpreads": FragmentRefs<"AppNavBar_user">;
  } | null | undefined;
};
export type AppRootLayoutQuery = {
  response: AppRootLayoutQuery$data;
  variables: AppRootLayoutQuery$variables;
};

const node: ConcreteRequest = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AppRootLayoutQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "current_user",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "AppNavBar_user"
          }
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
    "name": "AppRootLayoutQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "current_user",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "username",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "first_name",
            "storageKey": null
          },
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
    "cacheID": "b0838558052c21a04a835e70a569ab1d",
    "id": null,
    "metadata": {},
    "name": "AppRootLayoutQuery",
    "operationKind": "query",
    "text": "query AppRootLayoutQuery {\n  current_user {\n    ...AppNavBar_user\n    id\n  }\n}\n\nfragment AppNavBar_user on User {\n  username\n  first_name\n}\n"
  }
};

(node as any).hash = "5ac739846a7bc3fbedd15c5a0a96df7a";

export default node;
