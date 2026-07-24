/**
 * @generated SignedSource<<71d52047e473449f3333b1c103ea1ce4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type RepoSettingsPanelUpdateVisibilityMutation$variables = {
  id: string;
  visibility: RepositoryVisibility;
};
export type RepoSettingsPanelUpdateVisibilityMutation$data = {
  readonly update_repository_visibility: {
    readonly id: string | null | undefined;
    readonly visibility: RepositoryVisibility | null | undefined;
  } | null | undefined;
};
export type RepoSettingsPanelUpdateVisibilityMutation = {
  response: RepoSettingsPanelUpdateVisibilityMutation$data;
  variables: RepoSettingsPanelUpdateVisibilityMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "visibility"
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
      },
      {
        "kind": "Variable",
        "name": "visibility",
        "variableName": "visibility"
      }
    ],
    "concreteType": "Repository",
    "kind": "LinkedField",
    "name": "update_repository_visibility",
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
        "name": "visibility",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RepoSettingsPanelUpdateVisibilityMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RepoSettingsPanelUpdateVisibilityMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "604121eced28f45fcefb7b95726119d6",
    "id": null,
    "metadata": {},
    "name": "RepoSettingsPanelUpdateVisibilityMutation",
    "operationKind": "mutation",
    "text": "mutation RepoSettingsPanelUpdateVisibilityMutation(\n  $id: ID!\n  $visibility: RepositoryVisibility!\n) {\n  update_repository_visibility(id: $id, visibility: $visibility) {\n    id\n    visibility\n  }\n}\n"
  }
};
})();

(node as any).hash = "666b06e304a8a2f81e4af30e243c1bb8";

export default node;
