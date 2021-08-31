/**
 * Contains all of the GraphQL queries and mutations that we might need while writing our tests.
 * If needed, feel free to add more.
 */

export const GET_PRODUCT = /* GraphQL */ `
    query GetProduct($id: ID!) {
        products {
            getProduct(id: $id) {
                id
                title
                description
            }
        }
    }
`;

export const CREATE_PRODUCT = /* GraphQL */ `
    mutation CreateProduct($data: ProductCreateInput!) {
        products {
            createProduct(data: $data) {
                id
                title
                description
            }
        }
    }
`;

export const UPDATE_PRODUCT = /* GraphQL*/ `
    mutation UpdateProduct($id: ID!, $data: ProductUpdateInput!) {
        products {
            updateProduct(id: $id, data: $data) {
                id
                title
                description
            }
        }
    }
`;

export const DELETE_PRODUCT = /* GraphQL */ `
    mutation DeleteProduct($id: ID!) {
        products {
            deleteProduct(id: $id) {
                id
                title
                description
            }
        }
    }
`;

export const LIST_PRODUCTS = /* GraphQL */ `
    query ListProducts($sort: ProductsListSort, $limit: Int, $after: String) {
        products {
            listProducts(sort: $sort, limit: $limit, after: $after) {
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
