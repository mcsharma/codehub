/**
 * @generated SignedSource<<99e9ecffedd54e3a3d2e7206003df07d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BooksListPageToggleFavoriteMutation$variables = {
  book_id: string;
};
export type BooksListPageToggleFavoriteMutation$data = {
  readonly toggle_favorite_book: {
    readonly id: string | null | undefined;
    readonly is_favorited: boolean | null | undefined;
  } | null | undefined;
};
export type BooksListPageToggleFavoriteMutation = {
  response: BooksListPageToggleFavoriteMutation$data;
  variables: BooksListPageToggleFavoriteMutation$variables;
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
    "name": "BooksListPageToggleFavoriteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BooksListPageToggleFavoriteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "000eb823e7314519edee4fba8fcadfa4",
    "id": null,
    "metadata": {},
    "name": "BooksListPageToggleFavoriteMutation",
    "operationKind": "mutation",
    "text": "mutation BooksListPageToggleFavoriteMutation(\n  $book_id: ID!\n) {\n  toggle_favorite_book(book_id: $book_id) {\n    id\n    is_favorited\n  }\n}\n"
  }
};
})();

(node as any).hash = "205203bd37d97d5fffbb7bd9c1ae4c53";

export default node;
