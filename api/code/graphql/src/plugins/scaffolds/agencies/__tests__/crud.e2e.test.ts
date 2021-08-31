import {
    GET_AGENCY,
    CREATE_AGENCY,
    DELETE_AGENCY,
    LIST_AGENCIES,
    UPDATE_AGENCY
} from "./graphql/agencies";
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

let testAgencies = [];

describe("Agencies CRUD tests (end-to-end)", () => {
    beforeEach(async () => {
        for (let i = 0; i < 3; i++) {
            testAgencies.push(
                await query({
                    query: CREATE_AGENCY,
                    variables: {
                        data: {
                            title: `Agency ${i}`,
                            description: `Agency ${i}'s description.`
                        }
                    }
                }).then(response => response.agencies.createAgency)
            );
        }
    });

    afterEach(async () => {
        for (let i = 0; i < 3; i++) {
            try {
                await query({
                    query: DELETE_AGENCY,
                    variables: {
                        id: testAgencies[i].id
                    }
                });
            } catch {
                // Some of the entries might've been deleted during runtime.
                // We can ignore thrown errors.
            }
        }
        testAgencies = [];
    });

    it("should be able to perform basic CRUD operations", async () => {
        // 1. Now that we have agencies created, let's see if they come up in a basic listAgencies query.
        const [agency0, agency1, agency2] = testAgencies;

        await query({
            query: LIST_AGENCIES,
            variables: { limit: 3 }
        }).then(response =>
            expect(response.agencies.listAgencies).toMatchObject({
                data: [agency2, agency1, agency0],
                meta: {
                    limit: 3
                }
            })
        );

        // 2. Delete agency 1.
        await query({
            query: DELETE_AGENCY,
            variables: {
                id: agency1.id
            }
        });

        await query({
            query: LIST_AGENCIES,
            variables: {
                limit: 2
            }
        }).then(response =>
            expect(response.agencies.listAgencies).toMatchObject({
                data: [agency2, agency0],
                meta: {
                    limit: 2
                }
            })
        );

        // 3. Update agency 0.
        await query({
            query: UPDATE_AGENCY,
            variables: {
                id: agency0.id,
                data: {
                    title: "Agency 0 - UPDATED",
                    description: `Agency 0's description - UPDATED.`
                }
            }
        }).then(response =>
            expect(response.agencies.updateAgency).toEqual({
                id: agency0.id,
                title: "Agency 0 - UPDATED",
                description: `Agency 0's description - UPDATED.`
            })
        );

        // 4. Get agency 0 after the update.
        await query({
            query: GET_AGENCY,
            variables: {
                id: agency0.id
            }
        }).then(response =>
            expect(response.agencies.getAgency).toEqual({
                id: agency0.id,
                title: "Agency 0 - UPDATED",
                description: `Agency 0's description - UPDATED.`
            })
        );
    });
});
