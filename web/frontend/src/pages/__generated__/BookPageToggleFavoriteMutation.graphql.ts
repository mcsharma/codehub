/**
 * @generated SignedSource<<b441814c01f81acd0ebd1fffb6d0677d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BookPageToggleFavoriteMutation$variables = {
  book_id: string;
};
export type BookPageToggleFavoriteMutation$data = {
  readonly toggle_favorite_book: {
    readonly id: string | null | undefined;
    readonly is_favorited: boolean | null | undefined;
  } | null | undefined;
};
export type BookPageToggleFavoriteMutation = {
  response: BookPageToggleFavoriteMutation$data;
  variables: BookPageToggleFavoriteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "book_id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "book_id",
        "variableName": "book_id"
      }
    ],
    "concreteType": "Book",
    "kind": "LinkedField",
    "name": "toggle_favorite_book",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "is_favorited",
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
    "name": "BookPageToggleFavoriteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BookPageToggleFavoriteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "68eb924225eba5b8571acc6166feb1fe",
    "id": null,
    "metadata": {},
    "name": "BookPageToggleFavoriteMutation",
    "operationKind": "mutation",
    "text": "mutation BookPageToggleFavoriteMutation(\n  $book_id: ID!\n) {\n  toggle_favorite_book(book_id: $book_id) {\n    id\n    is_favorited\n  }\n}\n"
  }
};
})();

(node as any).hash = "40edb0302a3c11d2671ed9a553d7976a";

export default node;
