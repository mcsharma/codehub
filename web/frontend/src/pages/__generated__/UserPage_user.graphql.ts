/**
 * @generated SignedSource<<28cabc62e7d36768c0703c66a0f609d6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type UserPage_user$data = {
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
  readonly " $fragmentType": "UserPage_user";
};
export type UserPage_user$key = {
  readonly " $data"?: UserPage_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserPage_user">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 20
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserPage_user",
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
      "args": (v1/*: any*/),
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
                (v0/*: any*/),
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
      "storageKey": "owned_repositories(first:20)"
    },
    {
      "alias": null,
      "args": (v1/*: any*/),
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
                (v0/*: any*/),
                (v2/*: any*/)
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
};
})();

(node as any).hash = "3cea1c69903cb62367a2a17cd4488ca6";

export default node;
