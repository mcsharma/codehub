/**
 * @generated SignedSource<<61dbb9a3fc85031dea344c3ca98c0173>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppHomePageQuery$variables = Record<PropertyKey, never>;
export type AppHomePageQuery$data = {
  readonly github_repositories: ReadonlyArray<{
    readonly default_branch: string | null | undefined;
    readonly description: string | null | undefined;
    readonly full_name: string | null | undefined;
    readonly html_url: string | null | undefined;
    readonly name: string | null | undefined;
    readonly private: boolean | null | undefined;
  }>;
  readonly github_viewer: {
    readonly avatar_url: string | null | undefined;
    readonly html_url: string | null | undefined;
    readonly login: string | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined;
};
export type AppHomePageQuery = {
  response: AppHomePageQuery$data;
  variables: AppHomePageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "html_url",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "GitHubUser",
    "kind": "LinkedField",
    "name": "github_viewer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "login",
        "storageKey": null
      },
      (v0/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "avatar_url",
        "storageKey": null
      },
      (v1/*: any*/)
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "GitHubRepository",
    "kind": "LinkedField",
    "name": "github_repositories",
    "plural": true,
    "selections": [
      (v0/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "full_name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "private",
        "storageKey": null
      },
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "description",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "default_branch",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AppHomePageQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "AppHomePageQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "9dd03e5b0b25097269ce47d90ad6b92c",
    "id": null,
    "metadata": {},
    "name": "AppHomePageQuery",
    "operationKind": "query",
    "text": "query AppHomePageQuery {\n  github_viewer {\n    login\n    name\n    avatar_url\n    html_url\n  }\n  github_repositories {\n    name\n    full_name\n    private\n    html_url\n    description\n    default_branch\n  }\n}\n"
  }
};
})();

(node as any).hash = "8df5e3be5408604165939789a5b8c8d6";

export default node;
