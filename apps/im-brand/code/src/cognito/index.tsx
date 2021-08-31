import cognitoAuthentication, { Options as CognitOptions } from "./logic";
import { Props } from "./Authentication";
import { ApolloLinkPlugin } from "@webiny/app/plugins/ApolloLinkPlugin";

export interface PasswordPolicy {
    minimumLength?: number;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSymbols?: boolean;
    requireUppercase?: boolean;
}

export interface Options extends CognitOptions {
    passwordPolicy?: PasswordPolicy;
    getIdentityData: Props["getIdentityData"];
}

export default (options: Options): ApolloLinkPlugin => {
    // Configure Amplify and register ApolloLinkPlugin to attach Authorization header on each GraphQL request.
    return cognitoAuthentication(options);
};
