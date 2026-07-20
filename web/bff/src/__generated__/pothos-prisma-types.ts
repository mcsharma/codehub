// @generated - This file is generated, DO NOT modify it directly!

/* eslint-disable */
import type { Prisma, ModelUser, ModelOrganization, Repository, Commit } from "@prisma/client";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
export default interface PrismaTypes {
    ModelUser: {
        Name: "ModelUser";
        Shape: ModelUser;
        Include: Prisma.ModelUserInclude;
        Select: Prisma.ModelUserSelect;
        OrderBy: Prisma.ModelUserOrderByWithRelationInput;
        WhereUnique: Prisma.ModelUserWhereUniqueInput;
        Where: Prisma.ModelUserWhereInput;
        Create: {};
        Update: {};
        RelationName: "adminOfOrganizations" | "ownedRepositories" | "adminOfRepositories" | "commitsAuthored";
        ListRelations: "adminOfOrganizations" | "ownedRepositories" | "adminOfRepositories" | "commitsAuthored";
        Relations: {
            adminOfOrganizations: {
                Shape: ModelOrganization[];
                Name: "ModelOrganization";
                Nullable: false;
            };
            ownedRepositories: {
                Shape: Repository[];
                Name: "Repository";
                Nullable: false;
            };
            adminOfRepositories: {
                Shape: Repository[];
                Name: "Repository";
                Nullable: false;
            };
            commitsAuthored: {
                Shape: Commit[];
                Name: "Commit";
                Nullable: false;
            };
        };
    };
    ModelOrganization: {
        Name: "ModelOrganization";
        Shape: ModelOrganization;
        Include: Prisma.ModelOrganizationInclude;
        Select: Prisma.ModelOrganizationSelect;
        OrderBy: Prisma.ModelOrganizationOrderByWithRelationInput;
        WhereUnique: Prisma.ModelOrganizationWhereUniqueInput;
        Where: Prisma.ModelOrganizationWhereInput;
        Create: {};
        Update: {};
        RelationName: "repositories" | "admins";
        ListRelations: "repositories" | "admins";
        Relations: {
            repositories: {
                Shape: Repository[];
                Name: "Repository";
                Nullable: false;
            };
            admins: {
                Shape: ModelUser[];
                Name: "ModelUser";
                Nullable: false;
            };
        };
    };
    Repository: {
        Name: "Repository";
        Shape: Repository;
        Include: Prisma.RepositoryInclude;
        Select: Prisma.RepositorySelect;
        OrderBy: Prisma.RepositoryOrderByWithRelationInput;
        WhereUnique: Prisma.RepositoryWhereUniqueInput;
        Where: Prisma.RepositoryWhereInput;
        Create: {};
        Update: {};
        RelationName: "ownerUser" | "ownerOrganization" | "admins" | "commits";
        ListRelations: "admins" | "commits";
        Relations: {
            ownerUser: {
                Shape: ModelUser | null;
                Name: "ModelUser";
                Nullable: true;
            };
            ownerOrganization: {
                Shape: ModelOrganization | null;
                Name: "ModelOrganization";
                Nullable: true;
            };
            admins: {
                Shape: ModelUser[];
                Name: "ModelUser";
                Nullable: false;
            };
            commits: {
                Shape: Commit[];
                Name: "Commit";
                Nullable: false;
            };
        };
    };
    Commit: {
        Name: "Commit";
        Shape: Commit;
        Include: Prisma.CommitInclude;
        Select: Prisma.CommitSelect;
        OrderBy: Prisma.CommitOrderByWithRelationInput;
        WhereUnique: Prisma.CommitWhereUniqueInput;
        Where: Prisma.CommitWhereInput;
        Create: {};
        Update: {};
        RelationName: "repository" | "author";
        ListRelations: never;
        Relations: {
            repository: {
                Shape: Repository;
                Name: "Repository";
                Nullable: false;
            };
            author: {
                Shape: ModelUser | null;
                Name: "ModelUser";
                Nullable: true;
            };
        };
    };
}
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"ModelUser\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isDeleted\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"username\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"data\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelOrganization\",\"kind\":\"object\",\"name\":\"adminOfOrganizations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationAdmins\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Repository\",\"kind\":\"object\",\"name\":\"ownedRepositories\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RepositoryOwner\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Repository\",\"kind\":\"object\",\"name\":\"adminOfRepositories\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RepositoryAdmins\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Commit\",\"kind\":\"object\",\"name\":\"commitsAuthored\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommitAuthor\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ModelOrganization\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isDeleted\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"data\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Repository\",\"kind\":\"object\",\"name\":\"repositories\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationRepositories\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"admins\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationAdmins\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Repository\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isDeleted\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"RepositoryVisibility\",\"kind\":\"enum\",\"name\":\"visibility\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"ownerUserId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"ownerUser\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RepositoryOwner\",\"relationFromFields\":[\"ownerUserId\"],\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"ownerOrganizationId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelOrganization\",\"kind\":\"object\",\"name\":\"ownerOrganization\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationRepositories\",\"relationFromFields\":[\"ownerOrganizationId\"],\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"admins\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RepositoryAdmins\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Commit\",\"kind\":\"object\",\"name\":\"commits\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommitToRepository\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"ownerUserId\",\"name\"]},{\"name\":null,\"fields\":[\"ownerOrganizationId\",\"name\"]}]},\"Commit\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"repositoryId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Repository\",\"kind\":\"object\",\"name\":\"repository\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommitToRepository\",\"relationFromFields\":[\"repositoryId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"sha\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"message\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"authorId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"author\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommitAuthor\",\"relationFromFields\":[\"authorId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"repositoryId\",\"sha\"]}]}}}}"); }