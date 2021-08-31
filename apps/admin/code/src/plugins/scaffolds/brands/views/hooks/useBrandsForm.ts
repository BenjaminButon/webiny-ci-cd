import { useCallback } from "react";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { useRouter } from "@webiny/react-router";
import { useSnackbar } from "@webiny/app-admin/hooks/useSnackbar";
import { GET_BRAND, CREATE_BRAND, UPDATE_BRAND, LIST_BRANDS } from "./graphql";

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

export const useBrandsForm = () => {
    const { location, history } = useRouter();
    const { showSnackbar } = useSnackbar();
    const searchParams = new URLSearchParams(location.search);
    const currentBrandId = searchParams.get("id");

    const getQuery = useQuery(GET_BRAND, {
        variables: { id: currentBrandId },
        skip: !currentBrandId,
        onError: error => {
            history.push("/brands");
            showSnackbar(error.message);
        }
    });

    const [create, createMutation] = useMutation(CREATE_BRAND, {
        refetchQueries: [{ query: LIST_BRANDS }]
    });

    const [update, updateMutation] = useMutation(UPDATE_BRAND);

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
                    const { id } = result.data.brands.createBrand;
                    history.push(`/brands?id=${id}`);
                }

                showSnackbar("Brand saved successfully.");
            } catch (e) {
                showSnackbar(e.message);
            }
        },
        [currentBrandId]
    );

    const brand = getQuery?.data?.brands?.getBrand;
    const emptyViewIsShown = !searchParams.has("new") && !loading && !brand;
    const currentBrand = useCallback(() => history.push("/brands?new"), []);
    const cancelEditing = useCallback(() => history.push("/brands"), []);

    return {
        loading,
        emptyViewIsShown,
        currentBrand,
        cancelEditing,
        brand,
        onSubmit
    };
};
