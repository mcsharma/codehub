/**
 * @generated SignedSource<<86ac023257e11d2bba8476d206837d46>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepoSettingsPanelDeleteMutation$variables = {
  id: string;
};
export type RepoSettingsPanelDeleteMutation$data = {
  readonly delete_repository: boolean | null | undefined;
};
export type RepoSettingsPanelDeleteMutation = {
  response: RepoSettingsPanelDeleteMutation$data;
  variables: RepoSettingsPanelDeleteMutation$variables;
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
    "name": "delete_repository",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RepoSettingsPanelDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RepoSettingsPanelDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ea58790f56e579e8deb4abab2ab260ea",
    "id": null,
    "metadata": {},
    "name": "RepoSettingsPanelDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation RepoSettingsPanelDeleteMutation(\n  $id: ID!\n) {\n  delete_repository(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "2a6e0be59a975c50bd67974d1fe07a74";

export default node;
