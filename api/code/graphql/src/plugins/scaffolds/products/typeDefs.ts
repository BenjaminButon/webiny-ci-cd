export default /* GraphQL */ `
    type Product {
        id: ID!
        title: String!
        description: String
        createdOn: DateTime!
        savedOn: DateTime!
        createdBy: ProductCreatedBy
    }

    type ProductCreatedBy {
        id: String!
        type: String!
        displayName: String!
    }

    input ProductCreateInput {
        title: String!
        description: String
    }

    input ProductUpdateInput {
        title: String
        description: String
    }

    type ProductsListMeta {
        limit: Number
        before: String
        after: String
    }

    enum ProductsListSort {
        createdOn_ASC
        createdOn_DESC
    }

    type ProductsList {
        data: [Product]
        meta: ProductsListMeta
    }

    type PublicProduct {
        id: ID!
        title: String!
        purchased: Boolean!
        datePurchased: String
    }

    type PublicProductsList {
        data: [PublicProduct!]!
        meta: ProductsListMeta
    }

    type ProductQuery {
        getProduct(id: ID!): Product
        
        # Lists products for brand users (admins)
        listProducts(
            limit: Int
            before: String
            after: String
            sort: ProductsListSort
        ): ProductsList!
        
        listPublicProducts: PublicProductsList!
    }

    type ProductMutation {
        # Creates and returns a new Product entry.
        createProduct(data: ProductCreateInput!): Product!

        # Updates and returns an existing Product entry.
        updateProduct(id: ID!, data: ProductUpdateInput!): Product!

        # Deletes and returns an existing Product entry.
        deleteProduct(id: ID!): Product!

        # Purchase product (when one brand is purchasing a product from another brand)
        purchaseProductFromBrand(brandId: ID!, productId: ID!): Boolean
    }

    extend type Query {
        products: ProductQuery
    }

    extend type Mutation {
        products: ProductMutation
    }
`;
