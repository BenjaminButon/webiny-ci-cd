import { handler } from "~/index";
import {
    GET_AGENCY,
    CREATE_AGENCY,
    DELETE_AGENCY,
    LIST_AGENCIES,
    UPDATE_AGENCY
} from "./graphql/agencies";

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

let testAgencies = [];

describe("Agencies CRUD tests (integration)", () => {
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
                }).then(response => response.data.agencies.createAgency)
            );
        }
    });

    afterEach(async () => {
        for (let i = 0; i < 3; i++) {
            await query({
                query: DELETE_AGENCY,
                variables: {
                    id: testAgencies[i].id
                }
            });
        }
        testAgencies = [];
    });

    it("should be able to perform basic CRUD operations", async () => {
        // 1. Now that we have agencies created, let's see if they come up in a basic listAgencies query.
        const [agency0, agency1, agency2] = testAgencies;

        await query({ query: LIST_AGENCIES }).then(response =>
            expect(response.data.agencies.listAgencies).toEqual({
                data: [agency2, agency1, agency0],
                meta: {
                    after: null,
                    before: null,
                    limit: 10
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
            query: LIST_AGENCIES
        }).then(response =>
            expect(response.data.agencies.listAgencies).toEqual({
                data: [agency2, agency0],
                meta: {
                    after: null,
                    before: null,
                    limit: 10
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
            expect(response.data.agencies.updateAgency).toEqual({
                id: agency0.id,
                title: "Agency 0 - UPDATED",
                description: `Agency 0's description - UPDATED.`
            })
        );

        // 5. Get agency 0 after the update.
        await query({
            query: GET_AGENCY,
            variables: { id: agency0.id }
        }).then(response =>
            expect(response.data.agencies.getAgency).toEqual({
                id: agency0.id,
                title: "Agency 0 - UPDATED",
                description: `Agency 0's description - UPDATED.`
            })
        );
    });

    test("should be able to use cursor-based pagination (desc)", async () => {
        const [agency0, agency1, agency2] = testAgencies;

        await query({
            query: LIST_AGENCIES,
            variables: {
                limit: 2
            }
        }).then(response =>
            expect(response.data.agencies.listAgencies).toEqual({
                data: [agency2, agency1],
                meta: {
                    after: agency1.id,
                    before: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_AGENCIES,
            variables: {
                limit: 2,
                after: agency1.id
            }
        }).then(response =>
            expect(response.data.agencies.listAgencies).toEqual({
                data: [agency0],
                meta: {
                    before: agency0.id,
                    after: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_AGENCIES,
            variables: {
                limit: 2,
                before: agency0.id
            }
        }).then(response =>
            expect(response.data.agencies.listAgencies).toEqual({
                data: [agency2, agency1],
                meta: {
                    after: agency1.id,
                    before: null,
                    limit: 2
                }
            })
        );
    });

    test("should be able to use cursor-based pagination (ascending)", async () => {
        const [agency0, agency1, agency2] = testAgencies;

        await query({
            query: LIST_AGENCIES,
            variables: {
                limit: 2,
                sort: "createdOn_ASC"
            }
        }).then(response =>
            expect(response.data.agencies.listAgencies).toEqual({
                data: [agency0, agency1],
                meta: {
                    after: agency1.id,
                    before: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_AGENCIES,
            variables: {
                limit: 2,
                sort: "createdOn_ASC",
                after: agency1.id
            }
        }).then(response =>
            expect(response.data.agencies.listAgencies).toEqual({
                data: [agency2],
                meta: {
                    before: agency2.id,
                    after: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_AGENCIES,
            variables: {
                limit: 2,
                sort: "createdOn_ASC",
                before: agency2.id
            }
        }).then(response =>
            expect(response.data.agencies.listAgencies).toEqual({
                data: [agency0, agency1],
                meta: {
                    after: agency1.id,
                    before: null,
                    limit: 2
                }
            })
        );
    });
});
