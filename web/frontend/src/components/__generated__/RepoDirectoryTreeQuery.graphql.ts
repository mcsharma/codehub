/**
 * @generated SignedSource<<ddaa35c5f81ed9f3d68c1726c46c2fdc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RepoDirectoryTreeQuery$variables = {
  name: string;
  owner_username: string;
  path: string;
  rev: string;
};
export type RepoDirectoryTreeQuery$data = {
  readonly repository_by_owner_and_name: {
    readonly directory: {
      readonly directories: ReadonlyArray<{
        readonly name: string | null | undefined;
        readonly path: string | null | undefined;
      }> | null | undefined;
      readonly files: ReadonlyArray<{
        readonly name: string | null | undefined;
        readonly path: string | null | undefined;
      }> | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type RepoDirectoryTreeQuery = {
  response: RepoDirectoryTreeQuery$data;
  variables: RepoDirectoryTreeQuery$variables;
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
v5 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "path",
    "storageKey": null
  }
],
v6 = {
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
    {
      "alias": null,
      "args": null,
      "concreteType": "RepoDirectoryEntry",
      "kind": "LinkedField",
      "name": "directories",
      "plural": true,
      "selections": (v5/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "RepoFileEntry",
      "kind": "LinkedField",
      "name": "files",
      "plural": true,
      "selections": (v5/*: any*/),
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
    "name": "RepoDirectoryTreeQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository_by_owner_and_name",
        "plural": false,
        "selections": [
          (v6/*: any*/)
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
    "name": "RepoDirectoryTreeQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository_by_owner_and_name",
        "plural": false,
        "selections": [
          (v6/*: any*/),
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
    "cacheID": "392b6ac102dd2590cc1a523608d7720e",
    "id": null,
    "metadata": {},
    "name": "RepoDirectoryTreeQuery",
    "operationKind": "query",
    "text": "query RepoDirectoryTreeQuery(\n  $owner_username: String!\n  $name: String!\n  $rev: String!\n  $path: String!\n) {\n  repository_by_owner_and_name(owner_username: $owner_username, name: $name) {\n    directory(rev: $rev, path: $path) {\n      directories {\n        name\n        path\n      }\n      files {\n        name\n        path\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b6c62fee6b93b895e7dbf8b88ffddc58";

export default node;
