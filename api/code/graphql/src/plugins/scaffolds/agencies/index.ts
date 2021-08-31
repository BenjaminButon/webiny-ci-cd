import { GraphQLSchemaPlugin } from "@webiny/handler-graphql/plugins/GraphQLSchemaPlugin";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import { Context } from "~/types";

/**
 * We expand the existing schema of our GraphQL server via the `GraphQLSchemaPlugin` plugin.
 * The two main properties it contains are the `typeDefs` and `resolvers`, which, respectively,
 * define how we want to expand the existing GraphQL schema and the resolver functions.
 * To learn more, open the imported `typeDefs` and `resolvers` files.
 */
export default new GraphQLSchemaPlugin<Context>({
    typeDefs,
    resolvers: {
        Query: {
            agencies: (_, __, context) => {
                // If agencies are a protected namespace, perform your access validation here, if you want to block requests to the whole namespace.
                return new resolvers.AgenciesQuery(context);
            }
        },
        Mutation: {
            agencies: (_, __, context) => {
                // If agencies are a protected namespace, perform your access validation here, if you want to block requests to the whole namespace.
                return new resolvers.AgenciesMutation(context);
            }
        }
    }
});
