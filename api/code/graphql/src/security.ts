import tenancy from "@webiny/api-tenancy";
import security, { SecurityIdentity } from "@webiny/api-security";
import personalAccessTokenAuthentication from "@webiny/api-security-admin-users/authentication/personalAccessToken";
import apiKeyAuthentication from "@webiny/api-security-admin-users/authentication/apiKey";
import apiKeyAuthorization from "@webiny/api-security-admin-users/authorization/apiKey";
import anonymousAuthorization from "@webiny/api-security-admin-users/authorization/anonymous";
import cognitoAuthentication from "@webiny/api-security-cognito-authentication";
import cognitoIdentityProvider from "@webiny/api-security-admin-users-cognito";
import { CustomerAuthorizationPlugin } from "./plugins/customers/CustomerAuthorizationPlugin";
import { UserAuthorizationPlugin } from "~/plugins/admins/UserAuthorizationPlugin";

export default () => [
    /**
     * Setup tenancy context, which is a requirement for all Webiny projects.
     * Learn more: https://www.webiny.com/docs/key-topics/multi-tenancy
     */
    tenancy(),

    /**
     * Setup Webiny Security Framework to handle authentication and authorization.
     * Learn more: https://www.webiny.com/docs/key-topics/security-framework/introduction
     */
    security(),

    /**
     * Cognito IDP plugin (hooks for User CRUD methods).
     * This plugin will perform CRUD operations on Amazon Cognito when you do something with the user
     * via the UI or API. Its purpose is to push changes to Cognito when they happen in your app.
     */
    cognitoIdentityProvider({
        region: process.env.COGNITO_REGION,
        userPoolId: process.env.COGNITO_USER_POOL_ID
    }),

    /**
     * Authentication plugin for Personal Access Tokens.
     * PATs are directly linked to Users. We consider a token to be valid, if we manage to load
     * a User who owns this particular token. The "identityType" is important, and it has to match
     * the "identityType" configured in the authorization plugin later in this file.
     */
    personalAccessTokenAuthentication({ identityType: "admin" }),

    /**
     * Authentication plugin for API Keys.
     * API Keys are a standalone entity, and are not connected to users in any way.
     * They identify a project, a 3rd party client, not the user.
     * They are used for programmatic API access, CMS data import/export, etc.
     */
    apiKeyAuthentication({ identityType: "api-key" }),

    /**
     * Cognito authentication plugin.
     * This plugin will verify the authorization token against a provided User Pool.
     */
    cognitoAuthentication({
        region: process.env.COGNITO_REGION,
        userPoolId: process.env.COGNITO_USER_POOL_ID,
        identityType: "admin"
    }),

    /**
     * Authorization plugin to fetch permissions for a verified API key.
     * The "identityType" must match the authentication plugin used to load the identity.
     */
    apiKeyAuthorization({ identityType: "api-key" }),

    /**
     * ! CUSTOM PLUGIN !
     * Authorization plugin to load user permissions for requested tenant.
     * The authorization will only be performed on identities whose "type" matches
     * the provided "identityType".
     */
    new UserAuthorizationPlugin({ identityType: "admin" }),

    /**
     * Authorization plugin to load permissions for anonymous requests.
     * This allows you to control which API resources can be accessed publicly.
     * The authorization is performed by loading permissions from the "anonymous" user group.
     */
    anonymousAuthorization(),

    /**
     * A dedicated User Pool for customers (users who are buying courses)
     */
    cognitoAuthentication({
        region: process.env.AWS_REGION,
        // This is the ID of the User Pool that was created manually.
        userPoolId: "eu-central-1_LnS7vBaqp",
        identityType: "customer",
        getIdentity({ identityType, token }) {
            return new SecurityIdentity({
                // Mandatory fields
                id: token.sub,
                displayName: `${token.given_name} ${token.family_name}`,
                type: identityType,
                // Arbitrary fields; You will be able to access these fields anywhere in your code.
                firstName: token.given_name,
                lastName: token.family_name,
                email: token.email,
                phone: token.phone_number
            });
        }
    }),
    /**
     * Authorization plugin for customers
     */
    new CustomerAuthorizationPlugin({ identityType: "customer" })
];
