/**
 * @generated SignedSource<<4c99e4f99595362e0578ccf6dc81bc88>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppHomePageQuery$variables = Record<PropertyKey, never>;
export type AppHomePageQuery$data = {
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
    "cacheID": "0d7736cf7f99b6106b438293405150dd",
    "id": null,
    "metadata": {},
    "name": "AppHomePageQuery",
    "operationKind": "query",
    "text": "query AppHomePageQuery {\n  noop\n}\n"
  }
};
})();

(node as any).hash = "a6bc4745321c44498fecfbff57f42100";

export default node;
