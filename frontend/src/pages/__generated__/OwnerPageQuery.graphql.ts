/**
 * @generated SignedSource<<86acbba81fb710f9e909d586f61821c0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OwnerPageQuery$variables = {
  name: string;
};
export type OwnerPageQuery$data = {
  readonly owner_by_name: {
    readonly __typename: "Organization";
    readonly " $fragmentSpreads": FragmentRefs<"OrgPage_org">;
  } | {
    readonly __typename: "User";
    readonly " $fragmentSpreads": FragmentRefs<"UserPage_user">;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
};
export type OwnerPageQuery = {
  response: OwnerPageQuery$data;
  variables: OwnerPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "name"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
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
  "name": "username",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "first_name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "last_name",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "data",
  "storageKey": null
},
v8 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v10 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Repository",
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v3/*: any*/),
      (v9/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "visibility",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "OwnerPageQuery",
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
                "args": null,
                "kind": "FragmentSpread",
                "name": "UserPage_user"
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "OrgPage_org"
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
    "name": "OwnerPageQuery",
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
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              {
                "alias": null,
                "args": (v8/*: any*/),
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
                    "selections": (v10/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": "owned_repositories(first:20)"
              },
              {
                "alias": null,
                "args": (v8/*: any*/),
                "concreteType": "UserAdmin_of_organizationsConnection",
                "kind": "LinkedField",
                "name": "admin_of_organizations",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserAdmin_of_organizationsConnectionEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Organization",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          (v9/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "admin_of_organizations(first:20)"
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v9/*: any*/),
              (v7/*: any*/),
              {
                "alias": null,
                "args": (v8/*: any*/),
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
                    "selections": (v10/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": "repositories(first:20)"
              },
              {
                "alias": null,
                "args": (v8/*: any*/),
                "concreteType": "OrganizationAdminsConnection",
                "kind": "LinkedField",
                "name": "admins",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "OrganizationAdminsConnectionEdge",
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
                          (v4/*: any*/),
                          (v5/*: any*/),
                          (v6/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "admins(first:20)"
              }
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
    "cacheID": "aa2cc1a41a9bb8e1e8eded9101ffb643",
    "id": null,
    "metadata": {},
    "name": "OwnerPageQuery",
    "operationKind": "query",
    "text": "query OwnerPageQuery(\n  $name: String!\n) {\n  owner_by_name(name: $name) {\n    __typename\n    ... on User {\n      ...UserPage_user\n      id\n    }\n    ... on Organization {\n      ...OrgPage_org\n      id\n    }\n  }\n}\n\nfragment OrgPage_org on Organization {\n  id\n  name\n  data\n  repositories(first: 20) {\n    edges {\n      node {\n        id\n        name\n        visibility\n      }\n    }\n  }\n  admins(first: 20) {\n    edges {\n      node {\n        id\n        username\n        first_name\n        last_name\n      }\n    }\n  }\n}\n\nfragment UserPage_user on User {\n  id\n  username\n  first_name\n  last_name\n  data\n  owned_repositories(first: 20) {\n    edges {\n      node {\n        id\n        name\n        visibility\n      }\n    }\n  }\n  admin_of_organizations(first: 20) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "cc5d8a1cb7576ecb530a19ad0606cfa0";

export default node;
