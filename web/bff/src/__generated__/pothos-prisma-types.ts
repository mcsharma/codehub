// @generated - This file is generated, DO NOT modify it directly!

/* eslint-disable */
import type { Prisma, ModelUser, AuthIdentity, Session, PersonalAccessToken, ModelOrganization, Repository } from "@prisma/client";
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
        RelationName: "adminOfOrganizations" | "ownedRepositories" | "adminOfRepositories" | "authIdentities" | "sessions" | "personalAccessTokens";
        ListRelations: "adminOfOrganizations" | "ownedRepositories" | "adminOfRepositories" | "authIdentities" | "sessions" | "personalAccessTokens";
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
            authIdentities: {
                Shape: AuthIdentity[];
                Name: "AuthIdentity";
                Nullable: false;
            };
            sessions: {
                Shape: Session[];
                Name: "Session";
                Nullable: false;
            };
            personalAccessTokens: {
                Shape: PersonalAccessToken[];
                Name: "PersonalAccessToken";
                Nullable: false;
            };
        };
    };
    AuthIdentity: {
        Name: "AuthIdentity";
        Shape: AuthIdentity;
        Include: Prisma.AuthIdentityInclude;
        Select: Prisma.AuthIdentitySelect;
        OrderBy: Prisma.AuthIdentityOrderByWithRelationInput;
        WhereUnique: Prisma.AuthIdentityWhereUniqueInput;
        Where: Prisma.AuthIdentityWhereInput;
        Create: {};
        Update: {};
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: ModelUser;
                Name: "ModelUser";
                Nullable: false;
            };
        };
    };
    Session: {
        Name: "Session";
        Shape: Session;
        Include: Prisma.SessionInclude;
        Select: Prisma.SessionSelect;
        OrderBy: Prisma.SessionOrderByWithRelationInput;
        WhereUnique: Prisma.SessionWhereUniqueInput;
        Where: Prisma.SessionWhereInput;
        Create: {};
        Update: {};
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: ModelUser;
                Name: "ModelUser";
                Nullable: false;
            };
        };
    };
    PersonalAccessToken: {
        Name: "PersonalAccessToken";
        Shape: PersonalAccessToken;
        Include: Prisma.PersonalAccessTokenInclude;
        Select: Prisma.PersonalAccessTokenSelect;
        OrderBy: Prisma.PersonalAccessTokenOrderByWithRelationInput;
        WhereUnique: Prisma.PersonalAccessTokenWhereUniqueInput;
        Where: Prisma.PersonalAccessTokenWhereInput;
        Create: {};
        Update: {};
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: ModelUser;
                Name: "ModelUser";
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
        RelationName: "ownerUser" | "ownerOrganization" | "admins";
        ListRelations: "admins";
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
        };
    };
}
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"ModelUser\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isDeleted\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"username\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"primaryEmail\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"data\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelOrganization\",\"kind\":\"object\",\"name\":\"adminOfOrganizations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationAdmins\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Repository\",\"kind\":\"object\",\"name\":\"ownedRepositories\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RepositoryOwner\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Repository\",\"kind\":\"object\",\"name\":\"adminOfRepositories\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RepositoryAdmins\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"AuthIdentity\",\"kind\":\"object\",\"name\":\"authIdentities\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AuthIdentityToModelUser\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Session\",\"kind\":\"object\",\"name\":\"sessions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ModelUserToSession\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PersonalAccessToken\",\"kind\":\"object\",\"name\":\"personalAccessTokens\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ModelUserToPersonalAccessToken\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"AuthIdentity\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AuthIdentityToModelUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"AuthProvider\",\"kind\":\"enum\",\"name\":\"provider\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"providerAccountId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"provider\",\"providerAccountId\"]}]},\"Session\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"expiresAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"tokenHash\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ModelUserToSession\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"PersonalAccessToken\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastUsedTime\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"label\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"tokenHash\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ModelUserToPersonalAccessToken\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ModelOrganization\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isDeleted\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"data\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Repository\",\"kind\":\"object\",\"name\":\"repositories\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationRepositories\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"admins\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationAdmins\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Repository\":{\"fields\":[{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isDeleted\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"RepositoryVisibility\",\"kind\":\"enum\",\"name\":\"visibility\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"ownerUserId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"ownerUser\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RepositoryOwner\",\"relationFromFields\":[\"ownerUserId\"],\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"ownerOrganizationId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelOrganization\",\"kind\":\"object\",\"name\":\"ownerOrganization\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationRepositories\",\"relationFromFields\":[\"ownerOrganizationId\"],\"isUpdatedAt\":false},{\"type\":\"ModelUser\",\"kind\":\"object\",\"name\":\"admins\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RepositoryAdmins\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"ownerUserId\",\"name\"]},{\"name\":null,\"fields\":[\"ownerOrganizationId\",\"name\"]}]}}}}"); }