/**
 * @generated SignedSource<<2e3cd9c3246f3d75ea7d1e444da5f6b3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type RepoPageQuery$variables = {
  name: string;
  owner_username: string;
};
export type RepoPageQuery$data = {
  readonly repository_by_owner_and_name: {
    readonly admins: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly first_name: string | null | undefined;
          readonly id: string | null | undefined;
          readonly last_name: string | null | undefined;
          readonly username: string | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
    readonly bookmarks: ReadonlyArray<{
      readonly name: string | null | undefined;
      readonly short_node: string | null | undefined;
    }> | null | undefined;
    readonly commits: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly author: string | null | undefined;
          readonly date: number | null | undefined;
          readonly description: string | null | undefined;
          readonly short_node: string | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
    readonly id: string | null | undefined;
    readonly name: string | null | undefined;
    readonly owner: {
      readonly __typename: "Organization";
      readonly name: string | null | undefined;
    } | {
      readonly __typename: "User";
      readonly first_name: string | null | undefined;
      readonly last_name: string | null | undefined;
      readonly username: string | null | undefined;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    } | null | undefined;
    readonly visibility: RepositoryVisibility | null | undefined;
  } | null | undefined;
};
export type RepoPageQuery = {
  response: RepoPageQuery$data;
  variables: RepoPageQuery$variables;
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
v2 = [
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
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "visibility",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "first_name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "last_name",
  "storageKey": null
},
v10 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v11 = {
  "alias": null,
  "args": (v10/*: any*/),
  "concreteType": "RepositoryAdminsConnection",
  "kind": "LinkedField",
  "name": "admins",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "RepositoryAdminsConnectionEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v3/*: any*/),
            (v7/*: any*/),
            (v8/*: any*/),
            (v9/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": "admins(first:20)"
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "short_node",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "concreteType": "Bookmark",
  "kind": "LinkedField",
  "name": "bookmarks",
  "plural": true,
  "selections": [
    (v4/*: any*/),
    (v12/*: any*/)
  ],
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": (v10/*: any*/),
  "concreteType": "CommitConnection",
  "kind": "LinkedField",
  "name": "commits",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "CommitEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Commit",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v12/*: any*/),
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
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": "commits(first:20)"
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RepoPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository_by_owner_and_name",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "owner",
            "plural": false,
            "selections": [
              (v6/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/)
                ],
                "type": "User",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v4/*: any*/)
                ],
                "type": "Organization",
                "abstractKey": null
              }
            ],
            "storageKey": null
          },
          (v11/*: any*/),
          (v13/*: any*/),
          (v14/*: any*/)
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
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RepoPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository_by_owner_and_name",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "owner",
            "plural": false,
            "selections": [
              (v6/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v3/*: any*/)
                ],
                "type": "User",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v4/*: any*/),
                  (v3/*: any*/)
                ],
                "type": "Organization",
                "abstractKey": null
              }
            ],
            "storageKey": null
          },
          (v11/*: any*/),
          (v13/*: any*/),
          (v14/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8d56275537b6ce746ab90080f04585b1",
    "id": null,
    "metadata": {},
    "name": "RepoPageQuery",
    "operationKind": "query",
    "text": "query RepoPageQuery(\n  $owner_username: String!\n  $name: String!\n) {\n  repository_by_owner_and_name(owner_username: $owner_username, name: $name) {\n    id\n    name\n    visibility\n    owner {\n      __typename\n      ... on User {\n        username\n        first_name\n        last_name\n        id\n      }\n      ... on Organization {\n        name\n        id\n      }\n    }\n    admins(first: 20) {\n      edges {\n        node {\n          id\n          username\n          first_name\n          last_name\n        }\n      }\n    }\n    bookmarks {\n      name\n      short_node\n    }\n    commits(first: 20) {\n      edges {\n        node {\n          short_node\n          description\n          author\n          date\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f8171360400ea1b1fff5cdb032c945de";

export default node;
