/**
 * @generated SignedSource<<8baf9db5d47c09b155dd2a4e82524537>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type UserPageQuery$variables = {
  username: string;
};
export type UserPageQuery$data = {
  readonly user_by_username: {
    readonly admin_of_organizations: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string | null | undefined;
          readonly name: string | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
    readonly data: string | null | undefined;
    readonly first_name: string | null | undefined;
    readonly id: string | null | undefined;
    readonly last_name: string | null | undefined;
    readonly owned_repositories: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string | null | undefined;
          readonly name: string | null | undefined;
          readonly visibility: RepositoryVisibility | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
    readonly username: string | null | undefined;
  } | null | undefined;
};
export type UserPageQuery = {
  response: UserPageQuery$data;
  variables: UserPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "username"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "username",
        "variableName": "username"
      }
    ],
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "user_by_username",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "username",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "first_name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "last_name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "data",
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
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
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v3/*: any*/),
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
            ],
            "storageKey": null
          }
        ],
        "storageKey": "owned_repositories(first:20)"
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v1/*: any*/),
                  (v3/*: any*/)
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
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UserPageQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserPageQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "4101b965935474077867ec667570e13d",
    "id": null,
    "metadata": {},
    "name": "UserPageQuery",
    "operationKind": "query",
    "text": "query UserPageQuery(\n  $username: String!\n) {\n  user_by_username(username: $username) {\n    id\n    username\n    first_name\n    last_name\n    data\n    owned_repositories(first: 20) {\n      edges {\n        node {\n          id\n          name\n          visibility\n        }\n      }\n    }\n    admin_of_organizations(first: 20) {\n      edges {\n        node {\n          id\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5f35d1f162d9da334b71a3b70db2c9b8";

export default node;
