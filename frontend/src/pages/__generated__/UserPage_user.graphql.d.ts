/**
 * @generated SignedSource<<28cabc62e7d36768c0703c66a0f609d6>>
 * @lightSyntaxTransform
 * @nogrep
 */
import { ReaderFragment } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type UserPage_user$data = {
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
    readonly " $fragmentType": "UserPage_user";
};
export type UserPage_user$key = {
    readonly " $data"?: UserPage_user$data;
    readonly " $fragmentSpreads": FragmentRefs<"UserPage_user">;
};
declare const node: ReaderFragment;
export default node;
