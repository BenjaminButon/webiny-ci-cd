import gql from "graphql-tag";

// The same set of fields is being used on all query and mutation operations below.
export const BRAND_FIELDS_FRAGMENT = /* GraphQL */ `
    fragment BrandFields on Brand {
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

export const LIST_BRANDS = gql`
    ${BRAND_FIELDS_FRAGMENT}
    query ListBrands($sort: BrandsListSort, $limit: Int, $after: String, $before: String) {
        brands {
            listBrands(sort: $sort, limit: $limit, after: $after, before: $before) {
                data {
                    ...BrandFields
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

export const CREATE_BRAND = gql`
    ${BRAND_FIELDS_FRAGMENT}
    mutation CreateBrand($data: BrandCreateInput!) {
        brands {
            createBrand(data: $data) {
                ...BrandFields
            }
        }
    }
`;

export const GET_BRAND = gql`
    ${BRAND_FIELDS_FRAGMENT}
    query GetBrand($id: ID!) {
        brands {
            getBrand(id: $id) {
                ...BrandFields
            }
        }
    }
`;

export const DELETE_BRAND = gql`
    ${BRAND_FIELDS_FRAGMENT}
    mutation DeleteBrand($id: ID!) {
        brands {
            deleteBrand(id: $id) {
                ...BrandFields
            }
        }
    }
`;

export const UPDATE_BRAND = gql`
    ${BRAND_FIELDS_FRAGMENT}
    mutation UpdateBrand($id: ID!, $data: BrandUpdateInput!) {
        brands {
            updateBrand(id: $id, data: $data) {
                ...BrandFields
            }
        }
    }
`;
