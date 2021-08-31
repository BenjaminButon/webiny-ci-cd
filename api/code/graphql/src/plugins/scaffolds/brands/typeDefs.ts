export default /* GraphQL */ `
    type Brand {
        id: ID!
        title: String!
        description: String
        createdOn: DateTime!
        savedOn: DateTime!
        createdBy: BrandCreatedBy
    }

    type BrandCreatedBy {
        id: String!
        type: String!
        displayName: String!
    }

    input BrandAdminUser {
        email: String!
        password: String!
        firstName: String!
        lastName: String!
    }

    input BrandCreateInput {
        title: String!
        description: String!
        admin: BrandAdminUser!
    }

    input BrandUpdateInput {
        title: String
        description: String
    }

    type BrandsListMeta {
        limit: Number
        before: String
        after: String
    }

    enum BrandsListSort {
        createdOn_ASC
        createdOn_DESC
    }

    type BrandsList {
        data: [Brand]
        meta: BrandsListMeta
    }

    type BrandQuery {
        getBrand(id: ID!): Brand
        listBrands(limit: Int, before: String, after: String, sort: BrandsListSort): BrandsList!
    }

    type BrandMutation {
        # Creates and returns a new Brand entry.
        createBrand(data: BrandCreateInput!): Brand!

        # Updates and returns an existing Brand entry.
        updateBrand(id: ID!, data: BrandUpdateInput!): Brand!

        # Deletes and returns an existing Brand entry.
        deleteBrand(id: ID!): Brand!
    }

    extend type Query {
        brands: BrandQuery
    }

    extend type Mutation {
        brands: BrandMutation
    }
`;
