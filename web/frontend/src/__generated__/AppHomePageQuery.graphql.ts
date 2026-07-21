/**
 * @generated SignedSource<<cf1bff5a12fe3d6dc20e28c4042e97e3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppHomePageQuery$variables = Record<PropertyKey, never>;
export type AppHomePageQuery$data = {
  readonly current_user: {
    readonly first_name: string | null | undefined;
    readonly id: string | null | undefined;
    readonly last_name: string | null | undefined;
    readonly username: string | null | undefined;
  } | null | undefined;
  readonly noop: boolean | null | undefined;
};
export type AppHomePageQuery = {
  response: AppHomePageQuery$data;
  variables: AppHomePageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "noop",
    "storageKey": null
  },
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
        "name": "id",
        "storageKey": null
      },
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
        "name": "last_name",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AppHomePageQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "AppHomePageQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "a80422878bcab9d111b9d326160ca201",
    "id": null,
    "metadata": {},
    "name": "AppHomePageQuery",
    "operationKind": "query",
    "text": "query AppHomePageQuery {\n  noop\n  current_user {\n    id\n    username\n    first_name\n    last_name\n  }\n}\n"
  }
};
})();

(node as any).hash = "c3217ad5dafafefff2cd1a08516fff41";

export default node;
