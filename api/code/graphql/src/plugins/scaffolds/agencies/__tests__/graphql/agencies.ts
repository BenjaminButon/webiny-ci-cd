/**
 * Contains all of the GraphQL queries and mutations that we might need while writing our tests.
 * If needed, feel free to add more.
 */

export const GET_AGENCY = /* GraphQL */ `
    query GetAgency($id: ID!) {
        agencies {
            getAgency(id: $id) {
                id
                title
                description
            }
        }
    }
`;

export const CREATE_AGENCY = /* GraphQL */ `
    mutation CreateAgency($data: AgencyCreateInput!) {
        agencies {
            createAgency(data: $data) {
                id
                title
                description
            }
        }
    }
`;

export const UPDATE_AGENCY = /* GraphQL*/ `
    mutation UpdateAgency($id: ID!, $data: AgencyUpdateInput!) {
        agencies {
            updateAgency(id: $id, data: $data) {
                id
                title
                description
            }
        }
    }
`;

export const DELETE_AGENCY = /* GraphQL */ `
    mutation DeleteAgency($id: ID!) {
        agencies {
            deleteAgency(id: $id) {
                id
                title
                description
            }
        }
    }
`;

export const LIST_AGENCIES = /* GraphQL */ `
    query ListAgencies($sort: AgenciesListSort, $limit: Int, $after: String) {
        agencies {
            listAgencies(sort: $sort, limit: $limit, after: $after) {
                data {
                    id
                    title
                    description
                }
                meta {
                    limit
                    after
                    before
                }
            }
        }
    }
`;
