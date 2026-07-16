/**
 * @generated SignedSource<<db4dab36caaa807e63ef168bcccbbb87>>
 * @lightSyntaxTransform
 * @nogrep
 */
import { ReaderFragment } from 'relay-runtime';
export type RepositoryVisibility = "PRIVATE" | "PUBLIC" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type OrgPage_org$data = {
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
    readonly " $fragmentType": "OrgPage_org";
};
export type OrgPage_org$key = {
    readonly " $data"?: OrgPage_org$data;
    readonly " $fragmentSpreads": FragmentRefs<"OrgPage_org">;
};
declare const node: ReaderFragment;
export default node;
