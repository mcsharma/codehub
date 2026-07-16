/**
 * @generated SignedSource<<b9bc08bf67f45a4a4c828e66a446db44>>
 * @lightSyntaxTransform
 * @nogrep
 */
import { ConcreteRequest } from 'relay-runtime';
export type OwnerPageQuery$variables = {
    name: string;
};
export type OwnerPageQuery$data = {
    readonly organization_by_name: {
        readonly id: string | null | undefined;
    } | null | undefined;
    readonly user_by_username: {
        readonly id: string | null | undefined;
    } | null | undefined;
};
export type OwnerPageQuery = {
    response: OwnerPageQuery$data;
    variables: OwnerPageQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
