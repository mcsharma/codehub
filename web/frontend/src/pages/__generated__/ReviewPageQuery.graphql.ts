/**
 * @generated SignedSource<<f61881ff91b8e28d3716082c0d488f4e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ReviewStatus = "ABANDONED" | "LANDED" | "LANDING" | "LAND_FAILED" | "OPEN" | "%future added value";
export type ReviewPageQuery$variables = {
  name: string;
  number: number;
  owner_username: string;
};
export type ReviewPageQuery$data = {
  readonly repository_by_owner_and_name: {
    readonly name: string | null | undefined;
    readonly review: {
      readonly author: {
        readonly username: string | null | undefined;
      } | null | undefined;
      readonly created_time: number | null | undefined;
      readonly land_error: string | null | undefined;
      readonly landed_node: string | null | undefined;
      readonly number: number | null | undefined;
      readonly status: ReviewStatus | null | undefined;
      readonly title: string | null | undefined;
      readonly versions: ReadonlyArray<{
        readonly base_node: string | null | undefined;
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
        readonly head_node: string | null | undefined;
        readonly version: number | null | undefined;
      }> | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type ReviewPageQuery = {
  response: ReviewPageQuery$data;
  variables: ReviewPageQuery$variables;
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
  "name": "number"
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
v5 = [
  {
    "kind": "Variable",
    "name": "number",
    "variableName": "number"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_time",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "landed_node",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "land_error",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "version",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "head_node",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "base_node",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
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
        (v8/*: any*/)
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
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
    "name": "ReviewPageQuery",
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
          {
            "alias": null,
            "args": (v5/*: any*/),
            "concreteType": "Review",
            "kind": "LinkedField",
            "name": "review",
            "plural": false,
            "selections": [
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v12/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ReviewVersion",
                "kind": "LinkedField",
                "name": "versions",
                "plural": true,
                "selections": [
                  (v13/*: any*/),
                  (v14/*: any*/),
                  (v15/*: any*/),
                  (v16/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
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
    "name": "ReviewPageQuery",
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
          {
            "alias": null,
            "args": (v5/*: any*/),
            "concreteType": "Review",
            "kind": "LinkedField",
            "name": "review",
            "plural": false,
            "selections": [
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v12/*: any*/),
                  (v17/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ReviewVersion",
                "kind": "LinkedField",
                "name": "versions",
                "plural": true,
                "selections": [
                  (v13/*: any*/),
                  (v14/*: any*/),
                  (v15/*: any*/),
                  (v16/*: any*/),
                  (v17/*: any*/)
                ],
                "storageKey": null
              },
              (v17/*: any*/)
            ],
            "storageKey": null
          },
          (v17/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "017f991a27de312d927dd51d6ecb1345",
    "id": null,
    "metadata": {},
    "name": "ReviewPageQuery",
    "operationKind": "query",
    "text": "query ReviewPageQuery(\n  $owner_username: String!\n  $name: String!\n  $number: Int!\n) {\n  repository_by_owner_and_name(owner_username: $owner_username, name: $name) {\n    name\n    review(number: $number) {\n      number\n      title\n      status\n      created_time\n      landed_node\n      land_error\n      author {\n        username\n        id\n      }\n      versions {\n        version\n        head_node\n        base_node\n        commit {\n          node\n          short_node\n          description\n          author\n          date\n          parents\n          files {\n            path\n            status\n          }\n          diff\n        }\n        id\n      }\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ec7f82881145d7f4e645ff7467eeaeb4";

export default node;
