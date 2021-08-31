import { GraphQLSchemaPlugin } from "@webiny/handler-graphql/plugins";
import { Context, Customer, PurchasedProduct } from "~/types";
import dbArgs from "./dbArgs";
import { ContextPlugin } from "@webiny/handler/plugins/ContextPlugin";

export default [
    new GraphQLSchemaPlugin<Context>({
        typeDefs: /* GraphQL */ `
            type CustomerProduct {
                productId: ID!
                datePurchased: String!
            }
            type CustomerLogin {
                id: ID!
                firstName: String!
                lastName: String!
                email: String
                phone: String
                # Products this customer has access to
                products: [CustomerProduct!]!
            }
            extend type Query {
                # Returns customer's app-related information (products, invoices, etc.).
                customerLogin: CustomerLogin
            }

            extend type Mutation {
                purchaseProduct(productId: ID!): Boolean
            }
        `,
        resolvers: {
            Query: {
                async customerLogin(_, args, context) {
                    const { db, security, tenancy } = context;
                    const identity = security.getIdentity();
                    if (!identity) {
                        return null;
                    }

                    const tenantId = tenancy.getCurrentTenant().id;

                    const keys = {
                        PK: `T#${tenantId}#C#${identity.id}`,
                        SK: "A"
                    };

                    let [[customer]] = await db.read<Customer>({
                        ...dbArgs,
                        query: keys
                    });

                    /**
                     * IMPORTANT:
                     * For this PoC, we also insert user's info into the database if it doesn't already exist.
                     * This streamlines the account creation process, but for real-life app, you will most likely
                     * implement a dedicated "signup" process.
                     */
                    if (!customer) {
                        // First login; create a customer record
                        customer = {
                            ...keys,
                            id: identity.id,
                            firstName: identity.firstName,
                            lastName: identity.lastName,
                            email: identity.email,
                            phone: identity.phone
                        };

                        await db.create({
                            ...dbArgs,
                            data: customer
                        });
                    }

                    return customer;
                }
            },
            Mutation: {
                async purchaseProduct(_, { productId }, context) {
                    return context.customers.purchaseProduct(productId);
                }
            },
            CustomerLogin: {
                products(customer, args, context) {
                    return context.customers.getPurchasedProducts();
                }
            }
        }
    }),
    new ContextPlugin<Context>(context => {
        // An example of how you can attach methods to work with your business logic to `context` so it's available
        // everywhere in the system. We recommend doing this via classes, but for this demo we'll go quick and dirty.

        // NOTE: in this example I'm using an old DB client. In your actual implementation, we recommend using "dynamodb-toolbox"
        // as demonstrated in the scaffolded plugins.
        context.customers = {
            async purchaseProduct(productId: string) {
                const { db, security, tenancy } = context;
                const brand = tenancy.getCurrentTenant();
                const identity = security.getIdentity();

                await db.create({
                    ...dbArgs,
                    data: {
                        // This Primary Key structure will allow us to load all customer's data at once, but also load only purchased products.
                        PK: `T#${brand.id}#C#${identity.id}`,
                        SK: `PRODUCT#${productId}`,
                        productId,
                        datePurchased: new Date().toISOString()
                    }
                });

                return true;
            },
            async getPurchasedProducts() {
                const { db, security, tenancy } = context;
                const brand = tenancy.getCurrentTenant();
                const identity = security.getIdentity();

                const [items] = await db.read<PurchasedProduct>({
                    ...dbArgs,
                    query: {
                        PK: `T#${brand.id}#C#${identity.id}`,
                        SK: { $beginsWith: `PRODUCT#` }
                    }
                });

                return items;
            }
        };
    })
];
