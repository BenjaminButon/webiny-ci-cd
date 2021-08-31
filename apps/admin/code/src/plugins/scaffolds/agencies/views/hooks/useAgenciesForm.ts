import { useCallback } from "react";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { useRouter } from "@webiny/react-router";
import { useSnackbar } from "@webiny/app-admin/hooks/useSnackbar";
import { GET_AGENCY, CREATE_AGENCY, UPDATE_AGENCY, LIST_AGENCIES } from "./graphql";

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

export const useAgenciesForm = () => {
    const { location, history } = useRouter();
    const { showSnackbar } = useSnackbar();
    const searchParams = new URLSearchParams(location.search);
    const currentAgencyId = searchParams.get("id");

    const getQuery = useQuery(GET_AGENCY, {
        variables: { id: currentAgencyId },
        skip: !currentAgencyId,
        onError: error => {
            history.push("/agencies");
            showSnackbar(error.message);
        }
    });

    const [create, createMutation] = useMutation(CREATE_AGENCY, {
        refetchQueries: [{ query: LIST_AGENCIES }]
    });

    const [update, updateMutation] = useMutation(UPDATE_AGENCY);

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
                    const { id } = result.data.agencies.createAgency;
                    history.push(`/agencies?id=${id}`);
                }

                showSnackbar("Agency saved successfully.");
            } catch (e) {
                showSnackbar(e.message);
            }
        },
        [currentAgencyId]
    );

    const agency = getQuery?.data?.agencies?.getAgency;
    const emptyViewIsShown = !searchParams.has("new") && !loading && !agency;
    const currentAgency = useCallback(() => history.push("/agencies?new"), []);
    const cancelEditing = useCallback(() => history.push("/agencies"), []);

    return {
        loading,
        emptyViewIsShown,
        currentAgency,
        cancelEditing,
        agency,
        onSubmit
    };
};
