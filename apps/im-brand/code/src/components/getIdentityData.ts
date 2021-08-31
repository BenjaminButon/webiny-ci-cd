import gql from "graphql-tag";

/**
 * `getIdentityData` is a function that has to return information about the identity (a user within Webiny).
 * ========================================================================================
 * This function will be executed after Cognito (or any other identity provider you may use) validates the credentials
 * and obtains a valid JWT. Since JWT doesn't contain all the necessary information about a user, we need to perform the
 * "login" query, which doesn't really do anything except fetches the user's information our app needs (like permissions, avatar, etc.)
 *
 * Using this "login" query you can return custom data relevant to the business logic of your app.
 * The `payload` argument contains the whole JWT token so you can conditionally perform different queries depending on
 * the information contained within the JWT.
 */

const LOGIN = gql`
    {
        customerLogin {
            id
            firstName
            lastName
            email
            phone
            products {
                productId
                datePurchased
            }
        }
    }
`;

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const getIdentityData = async ({ client, payload }) => {
    const { data } = await client.query({ query: LOGIN });
    return data.customerLogin;
};
