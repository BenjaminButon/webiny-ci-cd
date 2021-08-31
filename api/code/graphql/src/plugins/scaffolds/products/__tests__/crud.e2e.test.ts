import {
    GET_PRODUCT,
    CREATE_PRODUCT,
    DELETE_PRODUCT,
    LIST_PRODUCTS,
    UPDATE_PRODUCT
} from "./graphql/products";
import { request } from "graphql-request";

/**
 * An example of an end-to-end (E2E) test. You can use these to test if the overall cloud infrastructure
 * setup is working. That's why, here we're not executing the handler code directly, but issuing real
 * HTTP requests over to the deployed Amazon Cloudfront distribution. These tests provide the highest
 * level of confidence that our application is working, but they take more time in order to complete.
 * https://www.webiny.com/docs/how-to-guides/webiny-cli/scaffolding/extend-graphql-api#crude2etestts
 */

const query = async ({ query = "", variables = {} } = {}) => {
    return request(process.env.API_URL + "/graphql", query, variables);
};

let testProducts = [];

describe("Products CRUD tests (end-to-end)", () => {
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
                }).then(response => response.products.createProduct)
            );
        }
    });

    afterEach(async () => {
        for (let i = 0; i < 3; i++) {
            try {
                await query({
                    query: DELETE_PRODUCT,
                    variables: {
                        id: testProducts[i].id
                    }
                });
            } catch {
                // Some of the entries might've been deleted during runtime.
                // We can ignore thrown errors.
            }
        }
        testProducts = [];
    });

    it("should be able to perform basic CRUD operations", async () => {
        // 1. Now that we have products created, let's see if they come up in a basic listProducts query.
        const [product0, product1, product2] = testProducts;

        await query({
            query: LIST_PRODUCTS,
            variables: { limit: 3 }
        }).then(response =>
            expect(response.products.listProducts).toMatchObject({
                data: [product2, product1, product0],
                meta: {
                    limit: 3
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
            query: LIST_PRODUCTS,
            variables: {
                limit: 2
            }
        }).then(response =>
            expect(response.products.listProducts).toMatchObject({
                data: [product2, product0],
                meta: {
                    limit: 2
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
            expect(response.products.updateProduct).toEqual({
                id: product0.id,
                title: "Product 0 - UPDATED",
                description: `Product 0's description - UPDATED.`
            })
        );

        // 4. Get product 0 after the update.
        await query({
            query: GET_PRODUCT,
            variables: {
                id: product0.id
            }
        }).then(response =>
            expect(response.products.getProduct).toEqual({
                id: product0.id,
                title: "Product 0 - UPDATED",
                description: `Product 0's description - UPDATED.`
            })
        );
    });
});
