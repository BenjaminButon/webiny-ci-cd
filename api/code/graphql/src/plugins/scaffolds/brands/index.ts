import { GraphQLSchemaPlugin } from "@webiny/handler-graphql/plugins/GraphQLSchemaPlugin";
import { BrandsContext } from "./types";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";

/**
 * We expand the existing schema of our GraphQL server via the `GraphQLSchemaPlugin` plugin.
 * The two main properties it contains are the `typeDefs` and `resolvers`, which, respectively,
 * define how we want to expand the existing GraphQL schema and the resolver functions.
 * To learn more, open the imported `typeDefs` and `resolvers` files.
 */
export default new GraphQLSchemaPlugin<BrandsContext>({
    typeDefs,
    resolvers: {
        Query: {
            brands: (_, __, context) => {
                return new resolvers.BrandsQuery(context);
            }
        },
        Mutation: {
            brands: (_, __, context) => {
                return new resolvers.BrandsMutation(context);
            }
        }
    }
});
