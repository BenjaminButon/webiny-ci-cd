import { useCallback } from "react";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { useRouter } from "@webiny/react-router";
import { useSnackbar } from "@webiny/app-admin/hooks/useSnackbar";
import { GET_PRODUCT, CREATE_PRODUCT, UPDATE_PRODUCT, LIST_PRODUCTS } from "./graphql";

/**
 * Contains essential form functionality: data fetching, form submission, notifications, redirecting, and more.
 */

/**
 * Omits irrelevant values from the submitted form data (`id`, `createdOn`, `savedOn`, `createdBy`).
 * @param formData
 */
const getMutationData = formData => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdOn, savedOn, createdBy, ...data } = formData;
    return data;
};

export const useProductsForm = () => {
    const { location, history } = useRouter();
    const { showSnackbar } = useSnackbar();
    const searchParams = new URLSearchParams(location.search);
    const currentProductId = searchParams.get("id");

    const getQuery = useQuery(GET_PRODUCT, {
        variables: { id: currentProductId },
        skip: !currentProductId,
        onError: error => {
            history.push("/products");
            showSnackbar(error.message);
        }
    });

    const [create, createMutation] = useMutation(CREATE_PRODUCT, {
        refetchQueries: [{ query: LIST_PRODUCTS }]
    });

    const [update, updateMutation] = useMutation(UPDATE_PRODUCT);

    const loading = [getQuery, createMutation, updateMutation].some(item => item.loading);

    const onSubmit = useCallback(
        async formData => {
            const { id } = formData;
            const data = getMutationData(formData);
            const [operation, options] = id
                ? [update, { variables: { id, data } }]
                : [create, { variables: { data } }];

            try {
                const result = await operation(options);
                if (!id) {
                    const { id } = result.data.products.createProduct;
                    history.push(`/products?id=${id}`);
                }

                showSnackbar("Product saved successfully.");
            } catch (e) {
                showSnackbar(e.message);
            }
        },
        [currentProductId]
    );

    const product = getQuery?.data?.products?.getProduct;
    const emptyViewIsShown = !searchParams.has("new") && !loading && !product;
    const currentProduct = useCallback(() => history.push("/products?new"), []);
    const cancelEditing = useCallback(() => history.push("/products"), []);

    return {
        loading,
        emptyViewIsShown,
        currentProduct,
        cancelEditing,
        product,
        onSubmit
    };
};
