/**
 * @generated SignedSource<<b32939219738a3e7d482a84ffbfa41b5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AppNavBar_user$data = {
  readonly first_name: string | null | undefined;
  readonly username: string | null | undefined;
  readonly " $fragmentType": "AppNavBar_user";
};
export type AppNavBar_user$key = {
  readonly " $data"?: AppNavBar_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"AppNavBar_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AppNavBar_user",
  "selections": [
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
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "2aeeca92c39d0a1471f7f8f8d271458b";

export default node;
