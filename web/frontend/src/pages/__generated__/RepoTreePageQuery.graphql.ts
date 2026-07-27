/**
 * @generated SignedSource<<b278bcbc636163b6f945d50fb88bcdbe>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepoTreePageQuery$variables = {
  name: string;
  owner_username: string;
  path: string;
  rev: string;
};
export type RepoTreePageQuery$data = {
  readonly repository_by_owner_and_name: {
    readonly directory: {
      readonly directories: ReadonlyArray<{
        readonly name: string | null | undefined;
        readonly path: string | null | undefined;
      }> | null | undefined;
      readonly files: ReadonlyArray<{
        readonly last_commit_date: number | null | undefined;
        readonly last_commit_message: string | null | undefined;
        readonly name: string | null | undefined;
        readonly path: string | null | undefined;
      }> | null | undefined;
      readonly path: string | null | undefined;
    } | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined;
};
export type RepoTreePageQuery = {
  response: RepoTreePageQuery$data;
  variables: RepoTreePageQuery$variables;
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
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v7 = {
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
  "concreteType": "RepoDirectory",
  "kind": "LinkedField",
  "name": "directory",
  "plural": false,
  "selections": [
    (v6/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "RepoDirectoryEntry",
      "kind": "LinkedField",
      "name": "directories",
      "plural": true,
      "selections": [
        (v5/*: any*/),
        (v6/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "RepoFileEntry",
      "kind": "LinkedField",
      "name": "files",
      "plural": true,
      "selections": [
        (v5/*: any*/),
        (v6/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "last_commit_message",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "last_commit_date",
          "storageKey": null
        }
      ],
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
    "name": "RepoTreePageQuery",
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
          (v7/*: any*/)
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
    "name": "RepoTreePageQuery",
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
          (v7/*: any*/),
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
    "cacheID": "fff73eff981d2f4ff826140df9cb70b8",
    "id": null,
    "metadata": {},
    "name": "RepoTreePageQuery",
    "operationKind": "query",
    "text": "query RepoTreePageQuery(\n  $owner_username: String!\n  $name: String!\n  $rev: String!\n  $path: String!\n) {\n  repository_by_owner_and_name(owner_username: $owner_username, name: $name) {\n    name\n    directory(rev: $rev, path: $path) {\n      path\n      directories {\n        name\n        path\n      }\n      files {\n        name\n        path\n        last_commit_message\n        last_commit_date\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "d76ea908da5c705085a87cf04d722c82";

export default node;
