/**
 * @generated SignedSource<<74c5eb198c6faffa7494a2b6343f632e>>
 * @lightSyntaxTransform
 * @nogrep
 */
import { ConcreteRequest } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type RepoPageQuery$variables = {
    name: string;
    owner_username: string;
};
export type RepoPageQuery$data = {
    readonly repository_by_owner_and_name: {
        readonly admins: {
            readonly edges: ReadonlyArray<{
                readonly node: {
                    readonly first_name: string | null | undefined;
                    readonly id: string | null | undefined;
                    readonly last_name: string | null | undefined;
                    readonly username: string | null | undefined;
                } | null | undefined;
            } | null | undefined> | null | undefined;
        } | null | undefined;
        readonly commits: {
            readonly edges: ReadonlyArray<{
                readonly node: {
                    readonly author: {
                        readonly first_name: string | null | undefined;
                        readonly last_name: string | null | undefined;
                        readonly username: string | null | undefined;
                    } | null | undefined;
                    readonly id: string | null | undefined;
                    readonly message: string | null | undefined;
                    readonly sha: string | null | undefined;
                } | null | undefined;
            } | null | undefined> | null | undefined;
        } | null | undefined;
        readonly id: string | null | undefined;
        readonly name: string | null | undefined;
        readonly owner: {
            readonly __typename: "Organization";
            readonly name: string | null | undefined;
        } | {
            readonly __typename: "User";
            readonly first_name: string | null | undefined;
            readonly last_name: string | null | undefined;
            readonly username: string | null | undefined;
        } | {
            readonly __typename: "%other";
        } | null | undefined;
        readonly visibility: RepositoryVisibility | null | undefined;
    } | null | undefined;
};
export type RepoPageQuery = {
    response: RepoPageQuery$data;
    variables: RepoPageQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
