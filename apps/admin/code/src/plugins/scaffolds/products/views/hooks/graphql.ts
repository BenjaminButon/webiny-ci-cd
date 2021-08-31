import gql from "graphql-tag";

// The same set of fields is being used on all query and mutation operations below.
export const PRODUCT_FIELDS_FRAGMENT = /* GraphQL */ `
    fragment ProductFields on Product {
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

export const LIST_PRODUCTS = gql`
    ${PRODUCT_FIELDS_FRAGMENT}
    query ListProducts($sort: ProductsListSort, $limit: Int, $after: String, $before: String) {
        products {
            listProducts(sort: $sort, limit: $limit, after: $after, before: $before) {
                data {
                    ...ProductFields
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

export const CREATE_PRODUCT = gql`
    ${PRODUCT_FIELDS_FRAGMENT}
    mutation CreateProduct($data: ProductCreateInput!) {
        products {
            createProduct(data: $data) {
                ...ProductFields
            }
        }
    }
`;

export const GET_PRODUCT = gql`
    ${PRODUCT_FIELDS_FRAGMENT}
    query GetProduct($id: ID!) {
        products {
            getProduct(id: $id) {
                ...ProductFields
            }
        }
    }
`;

export const DELETE_PRODUCT = gql`
    ${PRODUCT_FIELDS_FRAGMENT}
    mutation DeleteProduct($id: ID!) {
        products {
            deleteProduct(id: $id) {
                ...ProductFields
            }
        }
    }
`;

export const UPDATE_PRODUCT = gql`
    ${PRODUCT_FIELDS_FRAGMENT}
    mutation UpdateProduct($id: ID!, $data: ProductUpdateInput!) {
        products {
            updateProduct(id: $id, data: $data) {
                ...ProductFields
            }
        }
    }
`;
