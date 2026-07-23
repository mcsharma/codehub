/**
 * @generated SignedSource<<1efbc64588877c65cbbdd7fc456f53c0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TokensPageCreateMutation$variables = {
  label: string;
};
export type TokensPageCreateMutation$data = {
  readonly create_personal_access_token: {
    readonly token: string | null | undefined;
  } | null | undefined;
};
export type TokensPageCreateMutation = {
  response: TokensPageCreateMutation$data;
  variables: TokensPageCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "label"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "label",
    "variableName": "label"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "token",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "TokensPageCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreatePersonalAccessTokenResult",
        "kind": "LinkedField",
        "name": "create_personal_access_token",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TokensPageCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreatePersonalAccessTokenResult",
        "kind": "LinkedField",
        "name": "create_personal_access_token",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
    "cacheID": "582f1e87dec8292595de644e9de2fd41",
    "id": null,
    "metadata": {},
    "name": "TokensPageCreateMutation",
    "operationKind": "mutation",
    "text": "mutation TokensPageCreateMutation(\n  $label: String!\n) {\n  create_personal_access_token(label: $label) {\n    token\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "f00ce2fad63f992c33fc9fb1ca3124dd";

export default node;
