export default /* GraphQL */ `
    type Agency {
        id: ID!
        title: String!
        description: String
        createdOn: DateTime!
        savedOn: DateTime!
        createdBy: AgencyCreatedBy
    }

    type AgencyCreatedBy {
        id: String!
        type: String!
        displayName: String!
    }
    
    input AgencyAdminUser {
        email: String!
        password: String!
        firstName: String!
        lastName: String!
    }

    input AgencyCreateInput {
        title: String!
        description: String!
        admin: AgencyAdminUser!
    }

    input AgencyUpdateInput {
        title: String
        description: String
    }

    type AgenciesListMeta {
        limit: Number
        before: String
        after: String
    }

    enum AgenciesListSort {
        createdOn_ASC
        createdOn_DESC
    }

    type AgenciesList {
        data: [Agency]
        meta: AgenciesListMeta
    }

    type AgencyQuery {
        getAgency(id: ID!): Agency
        listAgencies(
            limit: Int
            before: String
            after: String
            sort: AgenciesListSort
        ): AgenciesList!
    }

    type AgencyMutation {
        # Creates and returns a new Agency entry.
        createAgency(data: AgencyCreateInput!): Agency!

        # Updates and returns an existing Agency entry.
        updateAgency(id: ID!, data: AgencyUpdateInput!): Agency!

        # Deletes and returns an existing Agency entry.
        deleteAgency(id: ID!): Agency!
    }

    extend type Query {
        agencies: AgencyQuery
    }

    extend type Mutation {
        agencies: AgencyMutation
    }
`;
