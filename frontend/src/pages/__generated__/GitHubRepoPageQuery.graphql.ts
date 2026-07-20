/**
 * @generated SignedSource<<711a1cc61b2a3c94f753ad29e396ce63>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GitHubRepoPageQuery$variables = {
  owner: string;
  repo: string;
};
export type GitHubRepoPageQuery$data = {
  readonly github_commits: ReadonlyArray<{
    readonly author_date: string | null | undefined;
    readonly author_name: string | null | undefined;
    readonly html_url: string | null | undefined;
    readonly message: string | null | undefined;
    readonly sha: string | null | undefined;
  }>;
};
export type GitHubRepoPageQuery = {
  response: GitHubRepoPageQuery$data;
  variables: GitHubRepoPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "owner"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "repo"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "owner",
        "variableName": "owner"
      },
      {
        "kind": "Variable",
        "name": "repo",
        "variableName": "repo"
      }
    ],
    "concreteType": "GitHubCommit",
    "kind": "LinkedField",
    "name": "github_commits",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sha",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "message",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "author_name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "author_date",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "html_url",
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
    "name": "GitHubRepoPageQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "GitHubRepoPageQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d278d9f5f5c06346c2c25bbb61e3bd01",
    "id": null,
    "metadata": {},
    "name": "GitHubRepoPageQuery",
    "operationKind": "query",
    "text": "query GitHubRepoPageQuery(\n  $owner: String!\n  $repo: String!\n) {\n  github_commits(owner: $owner, repo: $repo) {\n    sha\n    message\n    author_name\n    author_date\n    html_url\n  }\n}\n"
  }
};
})();

(node as any).hash = "30b689219dcac222cde854f875176af2";

export default node;
