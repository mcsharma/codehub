/**
 * @generated SignedSource<<d6fd3a9ca11e1561c2738ba7c711ee26>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppLogoutMutation$variables = Record<PropertyKey, never>;
export type AppLogoutMutation$data = {
  readonly logout: boolean | null | undefined;
};
export type AppLogoutMutation = {
  response: AppLogoutMutation$data;
  variables: AppLogoutMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "logout",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AppLogoutMutation",
    "selections": (v0/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "AppLogoutMutation",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "5d41db6874007ffc839d246ac6ada864",
    "id": null,
    "metadata": {},
    "name": "AppLogoutMutation",
    "operationKind": "mutation",
    "text": "mutation AppLogoutMutation {\n  logout\n}\n"
  }
};
})();

(node as any).hash = "ff19b810a96855562841a0cd83c69fb7";

export default node;
