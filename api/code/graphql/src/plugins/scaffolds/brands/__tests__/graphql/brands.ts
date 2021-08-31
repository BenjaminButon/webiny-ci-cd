/**
 * Contains all of the GraphQL queries and mutations that we might need while writing our tests.
 * If needed, feel free to add more.
 */

export const GET_BRAND = /* GraphQL */ `
    query GetBrand($id: ID!) {
        brands {
            getBrand(id: $id) {
                id
                title
                description
            }
        }
    }
`;

export const CREATE_BRAND = /* GraphQL */ `
    mutation CreateBrand($data: BrandCreateInput!) {
        brands {
            createBrand(data: $data) {
                id
                title
                description
            }
        }
    }
`;

export const UPDATE_BRAND = /* GraphQL*/ `
    mutation UpdateBrand($id: ID!, $data: BrandUpdateInput!) {
        brands {
            updateBrand(id: $id, data: $data) {
                id
                title
                description
            }
        }
    }
`;

export const DELETE_BRAND = /* GraphQL */ `
    mutation DeleteBrand($id: ID!) {
        brands {
            deleteBrand(id: $id) {
                id
                title
                description
            }
        }
    }
`;

export const LIST_BRANDS = /* GraphQL */ `
    query ListBrands($sort: BrandsListSort, $limit: Int, $after: String) {
        brands {
            listBrands(sort: $sort, limit: $limit, after: $after) {
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
