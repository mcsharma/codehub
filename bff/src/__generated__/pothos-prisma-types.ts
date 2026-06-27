// @generated - This file is generated, DO NOT modify it directly!

/* eslint-disable */
import type { Prisma, ModelUser, Repository, Commit } from "@prisma/client";
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
        RelationName: "ownedRepositories" | "collaboratedRepositories" | "commitsAuthored";
        ListRelations: "ownedRepositories" | "collaboratedRepositories" | "commitsAuthored";
        Relations: {
            ownedRepositories: {
                Shape: Repository[];
                Name: "Repository";
                Nullable: false;
            };
            collaboratedRepositories: {
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
        RelationName: "owner" | "collaborators" | "commits";
        ListRelations: "collaborators" | "commits";
        Relations: {
            owner: {
                Shape: ModelUser;
                Name: "ModelUser";
                Nullable: false;
            };
            collaborators: {
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
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"ModelUser\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isDeleted\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"username\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"data\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Repository\",\"kind\":\"object\",\"name\":\"ownedRepositories\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RepositoryOwner\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Repository\",\"kind\":\"object\",\"name\":\"collaboratedRepositories\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RepositoryCollaborators\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Commit\",\"kind\":\"object\",\"name\":\"commitsAuthored\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommitAuthor\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Repository\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isDeleted\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"private\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"ownerId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"owner\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RepositoryOwner\",\"relationFromFields\":[\"ownerId\"],\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"collaborators\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RepositoryCollaborators\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Commit\",\"kind\":\"object\",\"name\":\"commits\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommitToRepository\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"ownerId\",\"name\"]}]},\"Commit\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"repositoryId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Repository\",\"kind\":\"object\",\"name\":\"repository\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommitToRepository\",\"relationFromFields\":[\"repositoryId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"sha\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"message\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"authorId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"author\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommitAuthor\",\"relationFromFields\":[\"authorId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"repositoryId\",\"sha\"]}]}}}}"); }