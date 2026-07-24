/**
 * @generated SignedSource<<b4a76bbbf06c92179c2acacf20640b7b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type RepoPageQuery$variables = {
  name: string;
  owner_username: string;
};
export type RepoPageQuery$data = {
  readonly current_user: {
    readonly username: string | null | undefined;
  } | null | undefined;
  readonly repository_by_owner_and_name: {
    readonly id: string | null | undefined;
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
  readonly " $fragmentSpreads": FragmentRefs<"RepoCommitsList_query">;
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v3 = [
  (v2/*: any*/)
],
v4 = [
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
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "visibility",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v9 = [
  (v2/*: any*/),
  (v5/*: any*/)
],
v10 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 15
  }
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
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "current_user",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository_by_owner_and_name",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "owner",
            "plural": false,
            "selections": [
              (v8/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": (v3/*: any*/),
                "type": "User",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v6/*: any*/)
                ],
                "type": "Organization",
                "abstractKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "args": (v4/*: any*/),
        "kind": "FragmentSpread",
        "name": "RepoCommitsList_query"
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
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "current_user",
        "plural": false,
        "selections": (v9/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository_by_owner_and_name",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "owner",
            "plural": false,
            "selections": [
              (v8/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": (v9/*: any*/),
                "type": "User",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v6/*: any*/),
                  (v5/*: any*/)
                ],
                "type": "Organization",
                "abstractKey": null
              }
            ],
            "storageKey": null
          },
          {
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
                      (v8/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cursor",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PageInfo",
                "kind": "LinkedField",
                "name": "pageInfo",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "endCursor",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "hasNextPage",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "commits(first:15)"
          },
          {
            "alias": null,
            "args": (v10/*: any*/),
            "filters": null,
            "handle": "connection",
            "key": "RepoCommitsList_repository_commits",
            "kind": "LinkedHandle",
            "name": "commits"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "2442620d3f3e1c7982c20d98ea3247b0",
    "id": null,
    "metadata": {},
    "name": "RepoPageQuery",
    "operationKind": "query",
    "text": "query RepoPageQuery(\n  $owner_username: String!\n  $name: String!\n) {\n  current_user {\n    username\n    id\n  }\n  repository_by_owner_and_name(owner_username: $owner_username, name: $name) {\n    id\n    name\n    visibility\n    owner {\n      __typename\n      ... on User {\n        username\n        id\n      }\n      ... on Organization {\n        name\n        id\n      }\n    }\n  }\n  ...RepoCommitsList_query_1SpurQ\n}\n\nfragment RepoCommitsList_query_1SpurQ on Query {\n  repository_by_owner_and_name(owner_username: $owner_username, name: $name) {\n    commits(first: 15) {\n      edges {\n        node {\n          node\n          short_node\n          description\n          author\n          date\n          __typename\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "86ee949128d5c6c9ea8d4c0aa8687bdd";

export default node;
