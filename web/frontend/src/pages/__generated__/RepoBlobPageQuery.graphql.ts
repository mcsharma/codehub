/**
 * @generated SignedSource<<4fd19518d9c5cca920ca2a74f1000f8b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type RepoBlobPageQuery$variables = {
  name: string;
  owner_username: string;
  path: string;
  rev: string;
};
export type RepoBlobPageQuery$data = {
  readonly current_user: {
    readonly username: string | null | undefined;
  } | null | undefined;
  readonly repository_by_owner_and_name: {
    readonly file: {
      readonly content: string | null | undefined;
      readonly isBinary: boolean | null | undefined;
      readonly isTooLarge: boolean | null | undefined;
      readonly path: string | null | undefined;
      readonly size: number | null | undefined;
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
export type RepoBlobPageQuery = {
  response: RepoBlobPageQuery$data;
  variables: RepoBlobPageQuery$variables;
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
  "concreteType": "RepoFile",
  "kind": "LinkedField",
  "name": "file",
  "plural": false,
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
      "name": "size",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isBinary",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isTooLarge",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "content",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v12 = [
  (v4/*: any*/),
  (v11/*: any*/)
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
    "name": "RepoBlobPageQuery",
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
          (v10/*: any*/)
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
    "name": "RepoBlobPageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "current_user",
        "plural": false,
        "selections": (v12/*: any*/),
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
                "selections": (v12/*: any*/),
                "type": "User",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v7/*: any*/),
                  (v11/*: any*/)
                ],
                "type": "Organization",
                "abstractKey": null
              }
            ],
            "storageKey": null
          },
          (v10/*: any*/),
          (v11/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "76c2b98a70a254fe585a9528519e79e8",
    "id": null,
    "metadata": {},
    "name": "RepoBlobPageQuery",
    "operationKind": "query",
    "text": "query RepoBlobPageQuery(\n  $owner_username: String!\n  $name: String!\n  $rev: String!\n  $path: String!\n) {\n  current_user {\n    username\n    id\n  }\n  repository_by_owner_and_name(owner_username: $owner_username, name: $name) {\n    name\n    visibility\n    owner {\n      __typename\n      ... on User {\n        username\n        id\n      }\n      ... on Organization {\n        name\n        id\n      }\n    }\n    file(rev: $rev, path: $path) {\n      path\n      size\n      isBinary\n      isTooLarge\n      content\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "73ae5c2c0ddd4d50624707118da444ef";

export default node;
