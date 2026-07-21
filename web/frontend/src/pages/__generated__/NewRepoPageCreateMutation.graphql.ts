/**
 * @generated SignedSource<<80713abc28a872e6923d45e90479b651>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type NewRepoPageCreateMutation$variables = {
  name: string;
  visibility: RepositoryVisibility;
};
export type NewRepoPageCreateMutation$data = {
  readonly create_repository: {
    readonly name: string | null | undefined;
  } | null | undefined;
};
export type NewRepoPageCreateMutation = {
  response: NewRepoPageCreateMutation$data;
  variables: NewRepoPageCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "visibility"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "name"
  },
  {
    "kind": "Variable",
    "name": "visibility",
    "variableName": "visibility"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "NewRepoPageCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "create_repository",
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
    "name": "NewRepoPageCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "create_repository",
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
    "cacheID": "7c68bad9d8ed70e9de67cbe013bd0205",
    "id": null,
    "metadata": {},
    "name": "NewRepoPageCreateMutation",
    "operationKind": "mutation",
    "text": "mutation NewRepoPageCreateMutation(\n  $name: String!\n  $visibility: RepositoryVisibility!\n) {\n  create_repository(name: $name, visibility: $visibility) {\n    name\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "6f97f76dcc920f4644ba619847bea7e8";

export default node;
