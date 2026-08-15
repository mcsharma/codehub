/**
 * @generated SignedSource<<46625954e6e6a025428d3869efe697e0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type NewBookPageCreateMutation$variables = {
  author_ids: ReadonlyArray<string>;
  publication_year?: number | null | undefined;
  publisher_id: string;
  title: string;
};
export type NewBookPageCreateMutation$data = {
  readonly create_book: {
    readonly id: string | null | undefined;
  } | null | undefined;
};
export type NewBookPageCreateMutation = {
  response: NewBookPageCreateMutation$data;
  variables: NewBookPageCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "author_ids"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "publication_year"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "publisher_id"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "title"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "author_ids",
        "variableName": "author_ids"
      },
      {
        "kind": "Variable",
        "name": "publication_year",
        "variableName": "publication_year"
      },
      {
        "kind": "Variable",
        "name": "publisher_id",
        "variableName": "publisher_id"
      },
      {
        "kind": "Variable",
        "name": "title",
        "variableName": "title"
      }
    ],
    "concreteType": "Book",
    "kind": "LinkedField",
    "name": "create_book",
    "plural": false,
    "selections": [
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
];
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
    "name": "NewBookPageCreateMutation",
    "selections": (v4/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "NewBookPageCreateMutation",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "208a9820a93c24a60c6cb934583037c8",
    "id": null,
    "metadata": {},
    "name": "NewBookPageCreateMutation",
    "operationKind": "mutation",
    "text": "mutation NewBookPageCreateMutation(\n  $title: String!\n  $publication_year: Int\n  $publisher_id: ID!\n  $author_ids: [ID!]!\n) {\n  create_book(title: $title, publication_year: $publication_year, publisher_id: $publisher_id, author_ids: $author_ids) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "f3ef5af0992254162163ea539c532253";

export default node;
