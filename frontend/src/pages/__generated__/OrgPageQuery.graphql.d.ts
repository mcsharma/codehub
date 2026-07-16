/**
 * @generated SignedSource<<84ce64d434ad535b67127d1914558dbe>>
 * @lightSyntaxTransform
 * @nogrep
 */
import { ConcreteRequest } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
export type OrgPageQuery$variables = {
    name: string;
};
export type OrgPageQuery$data = {
    readonly organization_by_name: {
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
        readonly data: string | null | undefined;
        readonly id: string | null | undefined;
        readonly name: string | null | undefined;
        readonly repositories: {
            readonly edges: ReadonlyArray<{
                readonly node: {
                    readonly id: string | null | undefined;
                    readonly name: string | null | undefined;
                    readonly visibility: RepositoryVisibility | null | undefined;
                } | null | undefined;
            } | null | undefined> | null | undefined;
        } | null | undefined;
    } | null | undefined;
};
export type OrgPageQuery = {
    response: OrgPageQuery$data;
    variables: OrgPageQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
