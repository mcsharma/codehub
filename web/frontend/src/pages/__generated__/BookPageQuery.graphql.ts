/**
 * @generated SignedSource<<981d7fcb76fb7d83d0271fca82268280>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BookPageQuery$variables = {
  id: string;
};
export type BookPageQuery$data = {
  readonly book: {
    readonly authors: ReadonlyArray<{
      readonly bio: string | null | undefined;
      readonly id: string | null | undefined;
      readonly name: string | null | undefined;
    }> | null | undefined;
    readonly id: string | null | undefined;
    readonly is_favorited: boolean | null | undefined;
    readonly publication_year: number | null | undefined;
    readonly publisher: {
      readonly id: string | null | undefined;
      readonly name: string | null | undefined;
    } | null | undefined;
    readonly title: string | null | undefined;
  } | null | undefined;
  readonly current_user: {
    readonly username: string | null | undefined;
  } | null | undefined;
};
export type BookPageQuery = {
  response: BookPageQuery$data;
  variables: BookPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "id",
      "variableName": "id"
    }
  ],
  "concreteType": "Book",
  "kind": "LinkedField",
  "name": "book",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "publication_year",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "is_favorited",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Publisher",
      "kind": "LinkedField",
      "name": "publisher",
      "plural": false,
      "selections": [
        (v2/*: any*/),
        (v3/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Author",
      "kind": "LinkedField",
      "name": "authors",
      "plural": true,
      "selections": [
        (v2/*: any*/),
        (v3/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "bio",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BookPageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "current_user",
        "plural": false,
        "selections": [
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      (v4/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BookPageQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "current_user",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      (v4/*: any*/)
    ]
  },
  "params": {
    "cacheID": "5ba9ed502fa601853f7223da14fd5eb8",
    "id": null,
    "metadata": {},
    "name": "BookPageQuery",
    "operationKind": "query",
    "text": "query BookPageQuery(\n  $id: ID!\n) {\n  current_user {\n    username\n    id\n  }\n  book(id: $id) {\n    id\n    title\n    publication_year\n    is_favorited\n    publisher {\n      id\n      name\n    }\n    authors {\n      id\n      name\n      bio\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e681c2f027dbea6c77a9de71b5fceb19";

export default node;
