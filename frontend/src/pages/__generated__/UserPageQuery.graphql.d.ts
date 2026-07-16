/**
 * @generated SignedSource<<8baf9db5d47c09b155dd2a4e82524537>>
 * @lightSyntaxTransform
 * @nogrep
 */
import { ConcreteRequest } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type UserPageQuery$variables = {
    username: string;
};
export type UserPageQuery$data = {
    readonly user_by_username: {
        readonly admin_of_organizations: {
            readonly edges: ReadonlyArray<{
                readonly node: {
                    readonly id: string | null | undefined;
                    readonly name: string | null | undefined;
                } | null | undefined;
            } | null | undefined> | null | undefined;
        } | null | undefined;
        readonly data: string | null | undefined;
        readonly first_name: string | null | undefined;
        readonly id: string | null | undefined;
        readonly last_name: string | null | undefined;
        readonly owned_repositories: {
            readonly edges: ReadonlyArray<{
                readonly node: {
                    readonly id: string | null | undefined;
                    readonly name: string | null | undefined;
                    readonly visibility: RepositoryVisibility | null | undefined;
                } | null | undefined;
            } | null | undefined> | null | undefined;
        } | null | undefined;
        readonly username: string | null | undefined;
    } | null | undefined;
};
export type UserPageQuery = {
    response: UserPageQuery$data;
    variables: UserPageQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
