/**
 * @generated SignedSource<<86acbba81fb710f9e909d586f61821c0>>
 * @lightSyntaxTransform
 * @nogrep
 */
import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OwnerPageQuery$variables = {
    name: string;
};
export type OwnerPageQuery$data = {
    readonly owner_by_name: {
        readonly __typename: "Organization";
        readonly " $fragmentSpreads": FragmentRefs<"OrgPage_org">;
    } | {
        readonly __typename: "User";
        readonly " $fragmentSpreads": FragmentRefs<"UserPage_user">;
    } | {
        readonly __typename: "%other";
    } | null | undefined;
};
export type OwnerPageQuery = {
    response: OwnerPageQuery$data;
    variables: OwnerPageQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
