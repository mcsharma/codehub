/**
 * @generated SignedSource<<b93c6305c2cc206e0c9edc0c3a6e796d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RepoCommitsList_query$data = {
  readonly repository_by_owner_and_name: {
    readonly commits: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly author: string | null | undefined;
          readonly date: number | null | undefined;
          readonly description: string | null | undefined;
          readonly node: string | null | undefined;
          readonly short_node: string | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "RepoCommitsList_query";
};
export type RepoCommitsList_query$key = {
  readonly " $data"?: RepoCommitsList_query$data;
  readonly " $fragmentSpreads": FragmentRefs<"RepoCommitsList_query">;
};

import RepoCommitsListPaginationQuery_graphql from './RepoCommitsListPaginationQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = [
  "repository_by_owner_and_name",
  "commits"
];
return {
  "argumentDefinitions": [
    {
      "defaultValue": 15,
      "kind": "LocalArgument",
      "name": "count"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cursor"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "name"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "owner_username"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "count",
        "cursor": "cursor",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "count",
          "cursor": "cursor"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [],
      "operation": RepoCommitsListPaginationQuery_graphql
    }
  },
  "name": "RepoCommitsList_query",
  "selections": [
    {
      "alias": null,
      "args": [
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
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "repository_by_owner_and_name",
      "plural": false,
      "selections": [
        {
          "alias": "commits",
          "args": null,
          "concreteType": "CommitConnection",
          "kind": "LinkedField",
          "name": "__RepoCommitsList_repository_commits_connection",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "CommitEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Commit",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "node",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "short_node",
                      "storageKey": null
                    },
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
                      "name": "author",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "date",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "__typename",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "cursor",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "PageInfo",
              "kind": "LinkedField",
              "name": "pageInfo",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "endCursor",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "hasNextPage",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "7047b652d45c474af9554c1bf7cefdfa";

export default node;
