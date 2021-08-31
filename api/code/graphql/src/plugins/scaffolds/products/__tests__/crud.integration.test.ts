import { handler } from "~/index";
import {
    GET_PRODUCT,
    CREATE_PRODUCT,
    DELETE_PRODUCT,
    LIST_PRODUCTS,
    UPDATE_PRODUCT
} from "./graphql/products";

/**
 * An example of an integration test. You can use these to test your GraphQL resolvers, for example,
 * ensure they are correctly interacting with the database and other cloud infrastructure resources
 * and services. These tests provide a good level of confidence that our application is working, and
 * can be reasonably fast to complete.
 * https://www.webiny.com/docs/how-to-guides/webiny-cli/scaffolding/extend-graphql-api#crudintegrationtestts
 */

const query = ({ query = "", variables = {} } = {}) => {
    return handler({
        httpMethod: "POST",
        headers: {},
        body: JSON.stringify({
            query,
            variables
        })
    }).then(response => JSON.parse(response.body));
};

let testProducts = [];

describe("Products CRUD tests (integration)", () => {
    beforeEach(async () => {
        for (let i = 0; i < 3; i++) {
            testProducts.push(
                await query({
                    query: CREATE_PRODUCT,
                    variables: {
                        data: {
                            title: `Product ${i}`,
                            description: `Product ${i}'s description.`
                        }
                    }
                }).then(response => response.data.products.createProduct)
            );
        }
    });

    afterEach(async () => {
        for (let i = 0; i < 3; i++) {
            await query({
                query: DELETE_PRODUCT,
                variables: {
                    id: testProducts[i].id
                }
            });
        }
        testProducts = [];
    });

    it("should be able to perform basic CRUD operations", async () => {
        // 1. Now that we have products created, let's see if they come up in a basic listProducts query.
        const [product0, product1, product2] = testProducts;

        await query({ query: LIST_PRODUCTS }).then(response =>
            expect(response.data.products.listProducts).toEqual({
                data: [product2, product1, product0],
                meta: {
                    after: null,
                    before: null,
                    limit: 10
                }
            })
        );

        // 2. Delete product 1.
        await query({
            query: DELETE_PRODUCT,
            variables: {
                id: product1.id
            }
        });

        await query({
            query: LIST_PRODUCTS
        }).then(response =>
            expect(response.data.products.listProducts).toEqual({
                data: [product2, product0],
                meta: {
                    after: null,
                    before: null,
                    limit: 10
                }
            })
        );

        // 3. Update product 0.
        await query({
            query: UPDATE_PRODUCT,
            variables: {
                id: product0.id,
                data: {
                    title: "Product 0 - UPDATED",
                    description: `Product 0's description - UPDATED.`
                }
            }
        }).then(response =>
            expect(response.data.products.updateProduct).toEqual({
                id: product0.id,
                title: "Product 0 - UPDATED",
                description: `Product 0's description - UPDATED.`
            })
        );

        // 5. Get product 0 after the update.
        await query({
            query: GET_PRODUCT,
            variables: { id: product0.id }
        }).then(response =>
            expect(response.data.products.getProduct).toEqual({
                id: product0.id,
                title: "Product 0 - UPDATED",
                description: `Product 0's description - UPDATED.`
            })
        );
    });

    test("should be able to use cursor-based pagination (desc)", async () => {
        const [product0, product1, product2] = testProducts;

        await query({
            query: LIST_PRODUCTS,
            variables: {
                limit: 2
            }
        }).then(response =>
            expect(response.data.products.listProducts).toEqual({
                data: [product2, product1],
                meta: {
                    after: product1.id,
                    before: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_PRODUCTS,
            variables: {
                limit: 2,
                after: product1.id
            }
        }).then(response =>
            expect(response.data.products.listProducts).toEqual({
                data: [product0],
                meta: {
                    before: product0.id,
                    after: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_PRODUCTS,
            variables: {
                limit: 2,
                before: product0.id
            }
        }).then(response =>
            expect(response.data.products.listProducts).toEqual({
                data: [product2, product1],
                meta: {
                    after: product1.id,
                    before: null,
                    limit: 2
                }
            })
        );
    });

    test("should be able to use cursor-based pagination (ascending)", async () => {
        const [product0, product1, product2] = testProducts;

        await query({
            query: LIST_PRODUCTS,
            variables: {
                limit: 2,
                sort: "createdOn_ASC"
            }
        }).then(response =>
            expect(response.data.products.listProducts).toEqual({
                data: [product0, product1],
                meta: {
                    after: product1.id,
                    before: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_PRODUCTS,
            variables: {
                limit: 2,
                sort: "createdOn_ASC",
                after: product1.id
            }
        }).then(response =>
            expect(response.data.products.listProducts).toEqual({
                data: [product2],
                meta: {
                    before: product2.id,
                    after: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_PRODUCTS,
            variables: {
                limit: 2,
                sort: "createdOn_ASC",
                before: product2.id
            }
        }).then(response =>
            expect(response.data.products.listProducts).toEqual({
                data: [product0, product1],
                meta: {
                    after: product1.id,
                    before: null,
                    limit: 2
                }
            })
        );
    });
});
