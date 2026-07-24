/**
 * @generated SignedSource<<af0d613ac41d625c9ae83fbad26c6054>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type RepoTreePageQuery$variables = {
  name: string;
  owner_username: string;
  path: string;
  rev: string;
};
export type RepoTreePageQuery$data = {
  readonly current_user: {
    readonly username: string | null | undefined;
  } | null | undefined;
  readonly repository_by_owner_and_name: {
    readonly directory: {
      readonly directories: ReadonlyArray<{
        readonly name: string | null | undefined;
        readonly path: string | null | undefined;
      }> | null | undefined;
      readonly files: ReadonlyArray<{
        readonly name: string | null | undefined;
        readonly path: string | null | undefined;
        readonly size: number | null | undefined;
      }> | null | undefined;
      readonly path: string | null | undefined;
    } | null | undefined;
    readonly name: string | null | undefined;
    readonly owner: {
      readonly __typename: "Organization";
      readonly name: string | null | undefined;
    } | {
      readonly __typename: "User";
      readonly username: string | null | undefined;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    } | null | undefined;
    readonly visibility: RepositoryVisibility | null | undefined;
  } | null | undefined;
};
export type RepoTreePageQuery = {
  response: RepoTreePageQuery$data;
  variables: RepoTreePageQuery$variables;
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
  "name": "owner_username"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "path"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "rev"
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v5 = [
  (v4/*: any*/)
],
v6 = [
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
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "visibility",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "path",
      "variableName": "path"
    },
    {
      "kind": "Variable",
      "name": "rev",
      "variableName": "rev"
    }
  ],
  "concreteType": "RepoDirectory",
  "kind": "LinkedField",
  "name": "directory",
  "plural": false,
  "selections": [
    (v10/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "RepoDirectoryEntry",
      "kind": "LinkedField",
      "name": "directories",
      "plural": true,
      "selections": [
        (v7/*: any*/),
        (v10/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "RepoFileEntry",
      "kind": "LinkedField",
      "name": "files",
      "plural": true,
      "selections": [
        (v7/*: any*/),
        (v10/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "size",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v13 = [
  (v4/*: any*/),
  (v12/*: any*/)
];
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
    "name": "RepoTreePageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "current_user",
        "plural": false,
        "selections": (v5/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository_by_owner_and_name",
        "plural": false,
        "selections": [
          (v7/*: any*/),
          (v8/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "owner",
            "plural": false,
            "selections": [
              (v9/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": (v5/*: any*/),
                "type": "User",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v7/*: any*/)
                ],
                "type": "Organization",
                "abstractKey": null
              }
            ],
            "storageKey": null
          },
          (v11/*: any*/)
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
      (v1/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "RepoTreePageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "current_user",
        "plural": false,
        "selections": (v13/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository_by_owner_and_name",
        "plural": false,
        "selections": [
          (v7/*: any*/),
          (v8/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "owner",
            "plural": false,
            "selections": [
              (v9/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": (v13/*: any*/),
                "type": "User",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v7/*: any*/),
                  (v12/*: any*/)
                ],
                "type": "Organization",
                "abstractKey": null
              }
            ],
            "storageKey": null
          },
          (v11/*: any*/),
          (v12/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0734d8c18753e991ec5916988d6bd8bb",
    "id": null,
    "metadata": {},
    "name": "RepoTreePageQuery",
    "operationKind": "query",
    "text": "query RepoTreePageQuery(\n  $owner_username: String!\n  $name: String!\n  $rev: String!\n  $path: String!\n) {\n  current_user {\n    username\n    id\n  }\n  repository_by_owner_and_name(owner_username: $owner_username, name: $name) {\n    name\n    visibility\n    owner {\n      __typename\n      ... on User {\n        username\n        id\n      }\n      ... on Organization {\n        name\n        id\n      }\n    }\n    directory(rev: $rev, path: $path) {\n      path\n      directories {\n        name\n        path\n      }\n      files {\n        name\n        path\n        size\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "695f32f85caa5ce36d998dbb13c4a021";

export default node;
