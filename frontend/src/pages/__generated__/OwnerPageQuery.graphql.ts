/**
 * @generated SignedSource<<b9bc08bf67f45a4a4c828e66a446db44>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type OwnerPageQuery$variables = {
  name: string;
};
export type OwnerPageQuery$data = {
  readonly organization_by_name: {
    readonly id: string | null | undefined;
  } | null | undefined;
  readonly user_by_username: {
    readonly id: string | null | undefined;
  } | null | undefined;
};
export type OwnerPageQuery = {
  response: OwnerPageQuery$data;
  variables: OwnerPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  }
],
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "username",
        "variableName": "name"
      }
    ],
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "user_by_username",
    "plural": false,
    "selections": (v1/*: any*/),
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "Organization",
    "kind": "LinkedField",
    "name": "organization_by_name",
    "plural": false,
    "selections": (v1/*: any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "OwnerPageQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "OwnerPageQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "52bd394845341883248fbab6248ed537",
    "id": null,
    "metadata": {},
    "name": "OwnerPageQuery",
    "operationKind": "query",
    "text": "query OwnerPageQuery(\n  $name: String!\n) {\n  user_by_username(username: $name) {\n    id\n  }\n  organization_by_name(name: $name) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "336e66b2eedf347efadaf308d3f02483";

export default node;
