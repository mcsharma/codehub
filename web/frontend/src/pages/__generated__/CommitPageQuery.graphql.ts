/**
 * @generated SignedSource<<c760ea2637ae93a3531fc621f033b7cf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CommitPageQuery$variables = {
  name: string;
  node: string;
  owner_username: string;
};
export type CommitPageQuery$data = {
  readonly repository_by_owner_and_name: {
    readonly commit: {
      readonly author: string | null | undefined;
      readonly date: number | null | undefined;
      readonly description: string | null | undefined;
      readonly diff: string | null | undefined;
      readonly files: ReadonlyArray<{
        readonly path: string | null | undefined;
        readonly status: string | null | undefined;
      }> | null | undefined;
      readonly node: string | null | undefined;
      readonly parents: ReadonlyArray<string> | null | undefined;
      readonly short_node: string | null | undefined;
    } | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined;
};
export type CommitPageQuery = {
  response: CommitPageQuery$data;
  variables: CommitPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "node"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner_username"
},
v3 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "name"
  },
  {
    "kind": "Variable",
    "name": "owner_username",
    "variableName": "owner_username"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "node",
      "variableName": "node"
    }
  ],
  "concreteType": "Commit",
  "kind": "LinkedField",
  "name": "commit",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "node",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "short_node",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "author",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "date",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "parents",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "CommitFile",
      "kind": "LinkedField",
      "name": "files",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "path",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "status",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "diff",
      "storageKey": null
    }
  ],
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
    "name": "CommitPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository_by_owner_and_name",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "CommitPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository_by_owner_and_name",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
    "cacheID": "edbe4bf69bf3cb28d8da610fafbf11a7",
    "id": null,
    "metadata": {},
    "name": "CommitPageQuery",
    "operationKind": "query",
    "text": "query CommitPageQuery(\n  $owner_username: String!\n  $name: String!\n  $node: String!\n) {\n  repository_by_owner_and_name(owner_username: $owner_username, name: $name) {\n    name\n    commit(node: $node) {\n      node\n      short_node\n      description\n      author\n      date\n      parents\n      files {\n        path\n        status\n      }\n      diff\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e0ff864d1624b19a30c082cd68387eed";

export default node;
