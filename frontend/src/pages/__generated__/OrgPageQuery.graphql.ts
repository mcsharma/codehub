/**
 * @generated SignedSource<<84ce64d434ad535b67127d1914558dbe>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type OrgPageQuery$variables = {
  name: string;
};
export type OrgPageQuery$data = {
  readonly organization_by_name: {
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
    readonly data: string | null | undefined;
    readonly id: string | null | undefined;
    readonly name: string | null | undefined;
    readonly repositories: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string | null | undefined;
          readonly name: string | null | undefined;
          readonly visibility: RepositoryVisibility | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type OrgPageQuery = {
  response: OrgPageQuery$data;
  variables: OrgPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "Organization",
    "kind": "LinkedField",
    "name": "organization_by_name",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "data",
        "storageKey": null
      },
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
                  (v2/*: any*/),
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
        "storageKey": "repositories(first:20)"
      },
      {
        "alias": null,
        "args": (v3/*: any*/),
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
                  }
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
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "OrgPageQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "OrgPageQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "6b771809437da77b17e049ba4d99c462",
    "id": null,
    "metadata": {},
    "name": "OrgPageQuery",
    "operationKind": "query",
    "text": "query OrgPageQuery(\n  $name: String!\n) {\n  organization_by_name(name: $name) {\n    id\n    name\n    data\n    repositories(first: 20) {\n      edges {\n        node {\n          id\n          name\n          visibility\n        }\n      }\n    }\n    admins(first: 20) {\n      edges {\n        node {\n          id\n          username\n          first_name\n          last_name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ce8715105b3cde44d5977101129a38e7";

export default node;
