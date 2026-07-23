/**
 * @generated SignedSource<<64626f7ee2b0e189b1f684ede690bb19>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type NewRepoPageCreateMutation$variables = {
  description?: string | null | undefined;
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
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "description"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "visibility"
},
v3 = [
  {
    "kind": "Variable",
    "name": "description",
    "variableName": "description"
  },
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "NewRepoPageCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "create_repository",
        "plural": false,
        "selections": [
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "NewRepoPageCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "create_repository",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
    "cacheID": "55132ace31b7a27ebf197a169cc5817c",
    "id": null,
    "metadata": {},
    "name": "NewRepoPageCreateMutation",
    "operationKind": "mutation",
    "text": "mutation NewRepoPageCreateMutation(\n  $name: String!\n  $description: String\n  $visibility: RepositoryVisibility!\n) {\n  create_repository(name: $name, description: $description, visibility: $visibility) {\n    name\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "afbe5afe17abc2211bfe4a385b4acee0";

export default node;
