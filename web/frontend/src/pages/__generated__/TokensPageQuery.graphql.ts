/**
 * @generated SignedSource<<3230be8a1fb69e3619156eece52e31bb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TokensPageQuery$variables = Record<PropertyKey, never>;
export type TokensPageQuery$data = {
  readonly my_personal_access_tokens: ReadonlyArray<{
    readonly created_time: number | null | undefined;
    readonly id: string | null | undefined;
    readonly label: string | null | undefined;
    readonly last_used_time: number | null | undefined;
  }> | null | undefined;
};
export type TokensPageQuery = {
  response: TokensPageQuery$data;
  variables: TokensPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "PersonalAccessToken",
    "kind": "LinkedField",
    "name": "my_personal_access_tokens",
    "plural": true,
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
        "name": "label",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "created_time",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "last_used_time",
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
    "name": "TokensPageQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "TokensPageQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "c31d3bf9c57074ff4f04d567698d3e01",
    "id": null,
    "metadata": {},
    "name": "TokensPageQuery",
    "operationKind": "query",
    "text": "query TokensPageQuery {\n  my_personal_access_tokens {\n    id\n    label\n    created_time\n    last_used_time\n  }\n}\n"
  }
};
})();

(node as any).hash = "92c85be5d1b194305fc7796fce6be4ae";

export default node;
