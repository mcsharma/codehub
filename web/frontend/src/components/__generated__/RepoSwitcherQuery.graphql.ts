/**
 * @generated SignedSource<<8c2afc8cae94a0dc2bd6b9001cdd8467>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VcsKind = "GIT" | "HG" | "%future added value";
export type RepoSwitcherQuery$variables = {
  ownerUsername: string;
};
export type RepoSwitcherQuery$data = {
  readonly owner_by_name: {
    readonly __typename: "Organization";
    readonly repositories: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly name: string | null | undefined;
          readonly vcs_kind: VcsKind | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
  } | {
    readonly __typename: "User";
    readonly owned_repositories: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly name: string | null | undefined;
          readonly vcs_kind: VcsKind | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
};
export type RepoSwitcherQuery = {
  response: RepoSwitcherQuery$data;
  variables: RepoSwitcherQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "ownerUsername"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "ownerUsername"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 50
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
  "args": null,
  "kind": "ScalarField",
  "name": "vcs_kind",
  "storageKey": null
},
v6 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Repository",
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "storageKey": null
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Repository",
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v4/*: any*/),
      (v5/*: any*/),
      (v7/*: any*/)
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RepoSwitcherQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "owner_by_name",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v3/*: any*/),
                "concreteType": "UserOwned_repositoriesConnection",
                "kind": "LinkedField",
                "name": "owned_repositories",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserOwned_repositoriesConnectionEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": (v6/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": "owned_repositories(first:50)"
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v3/*: any*/),
                "concreteType": "OrganizationRepositoriesConnection",
                "kind": "LinkedField",
                "name": "repositories",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "OrganizationRepositoriesConnectionEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": (v6/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": "repositories(first:50)"
              }
            ],
            "type": "Organization",
            "abstractKey": null
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RepoSwitcherQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "owner_by_name",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v3/*: any*/),
                "concreteType": "UserOwned_repositoriesConnection",
                "kind": "LinkedField",
                "name": "owned_repositories",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserOwned_repositoriesConnectionEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": (v8/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": "owned_repositories(first:50)"
              },
              (v7/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v3/*: any*/),
                "concreteType": "OrganizationRepositoriesConnection",
                "kind": "LinkedField",
                "name": "repositories",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "OrganizationRepositoriesConnectionEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": (v8/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": "repositories(first:50)"
              },
              (v7/*: any*/)
            ],
            "type": "Organization",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6cb6e198477eab376c81122cefb28b07",
    "id": null,
    "metadata": {},
    "name": "RepoSwitcherQuery",
    "operationKind": "query",
    "text": "query RepoSwitcherQuery(\n  $ownerUsername: String!\n) {\n  owner_by_name(name: $ownerUsername) {\n    __typename\n    ... on User {\n      owned_repositories(first: 50) {\n        edges {\n          node {\n            name\n            vcs_kind\n            id\n          }\n        }\n      }\n      id\n    }\n    ... on Organization {\n      repositories(first: 50) {\n        edges {\n          node {\n            name\n            vcs_kind\n            id\n          }\n        }\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "67d64f34134276fd8f86fe93ad8d86a5";

export default node;
