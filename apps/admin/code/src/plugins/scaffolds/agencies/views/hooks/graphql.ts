import gql from "graphql-tag";

// The same set of fields is being used on all query and mutation operations below.
export const AGENCY_FIELDS_FRAGMENT = /* GraphQL */ `
    fragment AgencyFields on Agency {
        id
        title
        description
        createdOn
        savedOn
        createdBy {
            id
            displayName
            type
        }
    }
`;

export const LIST_AGENCIES = gql`
    ${AGENCY_FIELDS_FRAGMENT}
    query ListAgencies($sort: AgenciesListSort, $limit: Int, $after: String, $before: String) {
        agencies {
            listAgencies(sort: $sort, limit: $limit, after: $after, before: $before) {
                data {
                    ...AgencyFields
                }
                meta {
                    before
                    after
                    limit
                }
            }
        }
    }
`;

export const CREATE_AGENCY = gql`
    ${AGENCY_FIELDS_FRAGMENT}
    mutation CreateAgency($data: AgencyCreateInput!) {
        agencies {
            createAgency(data: $data) {
                ...AgencyFields
            }
        }
    }
`;

export const GET_AGENCY = gql`
    ${AGENCY_FIELDS_FRAGMENT}
    query GetAgency($id: ID!) {
        agencies {
            getAgency(id: $id) {
                ...AgencyFields
            }
        }
    }
`;

export const DELETE_AGENCY = gql`
    ${AGENCY_FIELDS_FRAGMENT}
    mutation DeleteAgency($id: ID!) {
        agencies {
            deleteAgency(id: $id) {
                ...AgencyFields
            }
        }
    }
`;

export const UPDATE_AGENCY = gql`
    ${AGENCY_FIELDS_FRAGMENT}
    mutation UpdateAgency($id: ID!, $data: AgencyUpdateInput!) {
        agencies {
            updateAgency(id: $id, data: $data) {
                ...AgencyFields
            }
        }
    }
`;
