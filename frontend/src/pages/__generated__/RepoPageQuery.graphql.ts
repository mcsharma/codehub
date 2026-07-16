/**
 * @generated SignedSource<<74c5eb198c6faffa7494a2b6343f632e>>
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
    readonly commits: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly author: {
            readonly first_name: string | null | undefined;
            readonly last_name: string | null | undefined;
            readonly username: string | null | undefined;
          } | null | undefined;
          readonly id: string | null | undefined;
          readonly message: string | null | undefined;
          readonly sha: string | null | undefined;
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
  (v7/*: any*/),
  (v8/*: any*/),
  (v9/*: any*/)
],
v11 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "sha",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": (v11/*: any*/),
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
v15 = [
  (v7/*: any*/),
  (v8/*: any*/),
  (v9/*: any*/),
  (v3/*: any*/)
];
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
                "selections": (v10/*: any*/),
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
          {
            "alias": null,
            "args": (v11/*: any*/),
            "concreteType": "RepositoryCommitsConnection",
            "kind": "LinkedField",
            "name": "commits",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RepositoryCommitsConnectionEdge",
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
                      (v3/*: any*/),
                      (v12/*: any*/),
                      (v13/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "author",
                        "plural": false,
                        "selections": (v10/*: any*/),
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
          },
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
                "selections": (v15/*: any*/),
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
          {
            "alias": null,
            "args": (v11/*: any*/),
            "concreteType": "RepositoryCommitsConnection",
            "kind": "LinkedField",
            "name": "commits",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RepositoryCommitsConnectionEdge",
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
                      (v3/*: any*/),
                      (v12/*: any*/),
                      (v13/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "User",
                        "kind": "LinkedField",
                        "name": "author",
                        "plural": false,
                        "selections": (v15/*: any*/),
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
          },
          (v14/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "80b4b007baa48c501eaaabe5e32b4206",
    "id": null,
    "metadata": {},
    "name": "RepoPageQuery",
    "operationKind": "query",
    "text": "query RepoPageQuery(\n  $owner_username: String!\n  $name: String!\n) {\n  repository_by_owner_and_name(owner_username: $owner_username, name: $name) {\n    id\n    name\n    visibility\n    owner {\n      __typename\n      ... on User {\n        username\n        first_name\n        last_name\n        id\n      }\n      ... on Organization {\n        name\n        id\n      }\n    }\n    commits(first: 20) {\n      edges {\n        node {\n          id\n          sha\n          message\n          author {\n            username\n            first_name\n            last_name\n            id\n          }\n        }\n      }\n    }\n    admins(first: 20) {\n      edges {\n        node {\n          id\n          username\n          first_name\n          last_name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2e2c8164abd23f0b4fab09bd299b571e";

export default node;
