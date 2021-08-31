import { handler } from "~/index";
import { GET_BRAND, CREATE_BRAND, DELETE_BRAND, LIST_BRANDS, UPDATE_BRAND } from "./graphql/brands";

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

let testBrands = [];

describe("Brands CRUD tests (integration)", () => {
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
                }).then(response => response.data.brands.createBrand)
            );
        }
    });

    afterEach(async () => {
        for (let i = 0; i < 3; i++) {
            await query({
                query: DELETE_BRAND,
                variables: {
                    id: testBrands[i].id
                }
            });
        }
        testBrands = [];
    });

    it("should be able to perform basic CRUD operations", async () => {
        // 1. Now that we have brands created, let's see if they come up in a basic listBrands query.
        const [brand0, brand1, brand2] = testBrands;

        await query({ query: LIST_BRANDS }).then(response =>
            expect(response.data.brands.listBrands).toEqual({
                data: [brand2, brand1, brand0],
                meta: {
                    after: null,
                    before: null,
                    limit: 10
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
            query: LIST_BRANDS
        }).then(response =>
            expect(response.data.brands.listBrands).toEqual({
                data: [brand2, brand0],
                meta: {
                    after: null,
                    before: null,
                    limit: 10
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
            expect(response.data.brands.updateBrand).toEqual({
                id: brand0.id,
                title: "Brand 0 - UPDATED",
                description: `Brand 0's description - UPDATED.`
            })
        );

        // 5. Get brand 0 after the update.
        await query({
            query: GET_BRAND,
            variables: { id: brand0.id }
        }).then(response =>
            expect(response.data.brands.getBrand).toEqual({
                id: brand0.id,
                title: "Brand 0 - UPDATED",
                description: `Brand 0's description - UPDATED.`
            })
        );
    });

    test("should be able to use cursor-based pagination (desc)", async () => {
        const [brand0, brand1, brand2] = testBrands;

        await query({
            query: LIST_BRANDS,
            variables: {
                limit: 2
            }
        }).then(response =>
            expect(response.data.brands.listBrands).toEqual({
                data: [brand2, brand1],
                meta: {
                    after: brand1.id,
                    before: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_BRANDS,
            variables: {
                limit: 2,
                after: brand1.id
            }
        }).then(response =>
            expect(response.data.brands.listBrands).toEqual({
                data: [brand0],
                meta: {
                    before: brand0.id,
                    after: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_BRANDS,
            variables: {
                limit: 2,
                before: brand0.id
            }
        }).then(response =>
            expect(response.data.brands.listBrands).toEqual({
                data: [brand2, brand1],
                meta: {
                    after: brand1.id,
                    before: null,
                    limit: 2
                }
            })
        );
    });

    test("should be able to use cursor-based pagination (ascending)", async () => {
        const [brand0, brand1, brand2] = testBrands;

        await query({
            query: LIST_BRANDS,
            variables: {
                limit: 2,
                sort: "createdOn_ASC"
            }
        }).then(response =>
            expect(response.data.brands.listBrands).toEqual({
                data: [brand0, brand1],
                meta: {
                    after: brand1.id,
                    before: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_BRANDS,
            variables: {
                limit: 2,
                sort: "createdOn_ASC",
                after: brand1.id
            }
        }).then(response =>
            expect(response.data.brands.listBrands).toEqual({
                data: [brand2],
                meta: {
                    before: brand2.id,
                    after: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_BRANDS,
            variables: {
                limit: 2,
                sort: "createdOn_ASC",
                before: brand2.id
            }
        }).then(response =>
            expect(response.data.brands.listBrands).toEqual({
                data: [brand0, brand1],
                meta: {
                    after: brand1.id,
                    before: null,
                    limit: 2
                }
            })
        );
    });
});
