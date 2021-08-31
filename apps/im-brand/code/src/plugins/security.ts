import cognitoSecurity from "../cognito";
import { getIdentityData } from "../components/getIdentityData";

export default [
    /**
     * Configures Amplify, adds Cognito related UI fields, and attaches Authorization header
     * on every GraphQL request using the authenticated identity.
     */
    cognitoSecurity({
        region: process.env.REACT_APP_USER_POOL_REGION,
        userPoolId: process.env.REACT_APP_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
        getIdentityData,
        // This part is necessary for Amplify to be able to inject tokens from the URL
        // into its internal state and construct a user object.
        oauth: {
            redirectSignIn: `http://localhost:${process.env.REACT_APP_PORT}`,
            redirectSignOut: `http://localhost:${process.env.REACT_APP_PORT}`,
            domain: "im-poc-v2.auth.eu-central-1.amazoncognito.com",
            responseType: "token",
            scope: ["profile", "email"]
        }
    })
];
