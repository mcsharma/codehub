/**
 * @generated SignedSource<<db4dab36caaa807e63ef168bcccbbb87>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type OrgPage_org$data = {
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
  readonly " $fragmentType": "OrgPage_org";
};
export type OrgPage_org$key = {
  readonly " $data"?: OrgPage_org$data;
  readonly " $fragmentSpreads": FragmentRefs<"OrgPage_org">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OrgPage_org",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
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
                (v0/*: any*/),
                (v1/*: any*/),
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
      "args": (v2/*: any*/),
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
                (v0/*: any*/),
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
  "type": "Organization",
  "abstractKey": null
};
})();

(node as any).hash = "0613a24e005438e78953cae6dbc48537";

export default node;
