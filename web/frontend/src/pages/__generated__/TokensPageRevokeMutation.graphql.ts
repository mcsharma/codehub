/**
 * @generated SignedSource<<1c0f7bfbf1dda9afe9d6c161814c0948>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TokensPageRevokeMutation$variables = {
  id: string;
};
export type TokensPageRevokeMutation$data = {
  readonly revoke_personal_access_token: boolean | null | undefined;
};
export type TokensPageRevokeMutation = {
  response: TokensPageRevokeMutation$data;
  variables: TokensPageRevokeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "kind": "ScalarField",
    "name": "revoke_personal_access_token",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "TokensPageRevokeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TokensPageRevokeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ed65ce1dda9bbf59ee1160779739122c",
    "id": null,
    "metadata": {},
    "name": "TokensPageRevokeMutation",
    "operationKind": "mutation",
    "text": "mutation TokensPageRevokeMutation(\n  $id: ID!\n) {\n  revoke_personal_access_token(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "7b6d0673e0d882b4350b8140828801b6";

export default node;
