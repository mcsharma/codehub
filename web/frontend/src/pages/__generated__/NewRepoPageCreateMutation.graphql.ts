/**
 * @generated SignedSource<<ba8fa1530ff455e81a42a6c82490ae6e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type VcsKind = "GIT" | "HG" | "%future added value";
export type NewRepoPageCreateMutation$variables = {
  description?: string | null | undefined;
  kind: VcsKind;
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
  "name": "kind"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "visibility"
},
v4 = [
  {
    "kind": "Variable",
    "name": "description",
    "variableName": "description"
  },
  {
    "kind": "Variable",
    "name": "kind",
    "variableName": "kind"
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
v5 = {
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
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "NewRepoPageCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "create_repository",
        "plural": false,
        "selections": [
          (v5/*: any*/)
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
      (v2/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "NewRepoPageCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "create_repository",
        "plural": false,
        "selections": [
          (v5/*: any*/),
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
    "cacheID": "1d2324b8a0713f61334b535ca9915abd",
    "id": null,
    "metadata": {},
    "name": "NewRepoPageCreateMutation",
    "operationKind": "mutation",
    "text": "mutation NewRepoPageCreateMutation(\n  $name: String!\n  $description: String\n  $visibility: RepositoryVisibility!\n  $kind: VcsKind!\n) {\n  create_repository(name: $name, description: $description, visibility: $visibility, kind: $kind) {\n    name\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "c22fd2b03dda341d31f927d38793a918";

export default node;
