/**
 * @generated SignedSource<<b01c1c64f6c0fd3475d813b513dc8399>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FavoritesPageToggleFavoriteMutation$variables = {
  book_id: string;
};
export type FavoritesPageToggleFavoriteMutation$data = {
  readonly toggle_favorite_book: {
    readonly id: string | null | undefined;
    readonly is_favorited: boolean | null | undefined;
  } | null | undefined;
};
export type FavoritesPageToggleFavoriteMutation = {
  response: FavoritesPageToggleFavoriteMutation$data;
  variables: FavoritesPageToggleFavoriteMutation$variables;
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
    "name": "FavoritesPageToggleFavoriteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FavoritesPageToggleFavoriteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "37e6bd9b1c28398434be20352b94f5f3",
    "id": null,
    "metadata": {},
    "name": "FavoritesPageToggleFavoriteMutation",
    "operationKind": "mutation",
    "text": "mutation FavoritesPageToggleFavoriteMutation(\n  $book_id: ID!\n) {\n  toggle_favorite_book(book_id: $book_id) {\n    id\n    is_favorited\n  }\n}\n"
  }
};
})();

(node as any).hash = "ea045f36d94b7f09f920844e2c7522d6";

export default node;
