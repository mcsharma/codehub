/**
 * @generated SignedSource<<7e568cf872d19ff58929e1ac3336c1a9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepoBlobPageQuery$variables = {
  name: string;
  owner_username: string;
  path: string;
  rev: string;
};
export type RepoBlobPageQuery$data = {
  readonly repository_by_owner_and_name: {
    readonly file: {
      readonly content: string | null | undefined;
      readonly isBinary: boolean | null | undefined;
      readonly isTooLarge: boolean | null | undefined;
      readonly path: string | null | undefined;
      readonly size: number | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type RepoBlobPageQuery = {
  response: RepoBlobPageQuery$data;
  variables: RepoBlobPageQuery$variables;
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
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "path"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "rev"
},
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
  "args": [
    {
      "kind": "Variable",
      "name": "path",
      "variableName": "path"
    },
    {
      "kind": "Variable",
      "name": "rev",
      "variableName": "rev"
    }
  ],
  "concreteType": "RepoFile",
  "kind": "LinkedField",
  "name": "file",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "path",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "size",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isBinary",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isTooLarge",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "content",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RepoBlobPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository_by_owner_and_name",
        "plural": false,
        "selections": [
          (v5/*: any*/)
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
      (v0/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "RepoBlobPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository_by_owner_and_name",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "de35eea8fec3cfd77781e5b8ea35149a",
    "id": null,
    "metadata": {},
    "name": "RepoBlobPageQuery",
    "operationKind": "query",
    "text": "query RepoBlobPageQuery(\n  $owner_username: String!\n  $name: String!\n  $rev: String!\n  $path: String!\n) {\n  repository_by_owner_and_name(owner_username: $owner_username, name: $name) {\n    file(rev: $rev, path: $path) {\n      path\n      size\n      isBinary\n      isTooLarge\n      content\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "7796b16cd5d729a7fbb670969d0b8ff5";

export default node;
