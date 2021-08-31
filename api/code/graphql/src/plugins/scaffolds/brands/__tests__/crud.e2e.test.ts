import { GET_BRAND, CREATE_BRAND, DELETE_BRAND, LIST_BRANDS, UPDATE_BRAND } from "./graphql/brands";
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

let testBrands = [];

describe("Brands CRUD tests (end-to-end)", () => {
    beforeEach(async () => {
        for (let i = 0; i < 3; i++) {
            testBrands.push(
                await query({
                    query: CREATE_BRAND,
                    variables: {
                        data: {
                            title: `Brand ${i}`,
                            description: `Brand ${i}'s description.`
                        }
                    }
                }).then(response => response.brands.createBrand)
            );
        }
    });

    afterEach(async () => {
        for (let i = 0; i < 3; i++) {
            try {
                await query({
                    query: DELETE_BRAND,
                    variables: {
                        id: testBrands[i].id
                    }
                });
            } catch {
                // Some of the entries might've been deleted during runtime.
                // We can ignore thrown errors.
            }
        }
        testBrands = [];
    });

    it("should be able to perform basic CRUD operations", async () => {
        // 1. Now that we have brands created, let's see if they come up in a basic listBrands query.
        const [brand0, brand1, brand2] = testBrands;

        await query({
            query: LIST_BRANDS,
            variables: { limit: 3 }
        }).then(response =>
            expect(response.brands.listBrands).toMatchObject({
                data: [brand2, brand1, brand0],
                meta: {
                    limit: 3
                }
            })
        );

        // 2. Delete brand 1.
        await query({
            query: DELETE_BRAND,
            variables: {
                id: brand1.id
            }
        });

        await query({
            query: LIST_BRANDS,
            variables: {
                limit: 2
            }
        }).then(response =>
            expect(response.brands.listBrands).toMatchObject({
                data: [brand2, brand0],
                meta: {
                    limit: 2
                }
            })
        );

        // 3. Update brand 0.
        await query({
            query: UPDATE_BRAND,
            variables: {
                id: brand0.id,
                data: {
                    title: "Brand 0 - UPDATED",
                    description: `Brand 0's description - UPDATED.`
                }
            }
        }).then(response =>
            expect(response.brands.updateBrand).toEqual({
                id: brand0.id,
                title: "Brand 0 - UPDATED",
                description: `Brand 0's description - UPDATED.`
            })
        );

        // 4. Get brand 0 after the update.
        await query({
            query: GET_BRAND,
            variables: {
                id: brand0.id
            }
        }).then(response =>
            expect(response.brands.getBrand).toEqual({
                id: brand0.id,
                title: "Brand 0 - UPDATED",
                description: `Brand 0's description - UPDATED.`
            })
        );
    });
});
