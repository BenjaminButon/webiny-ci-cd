import React from "react";
import gql from "graphql-tag";
import { useSecurity } from "@webiny/app-security";
import { useQuery, useMutation } from "@apollo/react-hooks";

const LIST_PRODUCTS = gql`
    query ListPublicProducts {
        products {
            listPublicProducts {
                data {
                    id
                    title
                    purchased
                    datePurchased
                }
            }
        }
    }
`;

const PURCHASE_PRODUCT = gql`
    mutation PurchaseProduct($productId: ID!) {
        purchaseProduct(productId: $productId)
    }
`;

export const Dashboard = () => {
    const { identity } = useSecurity();
    const { data, loading } = useQuery(LIST_PRODUCTS);
    const [runPurchase] = useMutation(PURCHASE_PRODUCT, {
        refetchQueries: ["ListPublicProducts"]
    });

    if (loading) {
        return <span>Loading products...</span>;
    }

    const purchaseProduct = productId => {
        runPurchase({ variables: { productId } });
    };

    const products = data.products.listPublicProducts.data;

    return (
        <div>
            <button onClick={() => identity.logout()}>Logout</button>
            <h4>Identity Object</h4>
            <pre>{JSON.stringify(identity, null, 2)}</pre>
            <h4>All Products</h4>
            <ul>
                {products.map(product => {
                    return (
                        <li key={product.id}>
                            {product.title} -{" "}
                            {product.purchased ? (
                                `Purchased on: ${product.datePurchased}`
                            ) : (
                                <button onClick={() => purchaseProduct(product.id)}>
                                    Purchase
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
