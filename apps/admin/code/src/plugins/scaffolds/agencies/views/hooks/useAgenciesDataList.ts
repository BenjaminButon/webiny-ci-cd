import { useCallback, useReducer } from "react";
import { useRouter } from "@webiny/react-router";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useSnackbar } from "@webiny/app-admin/hooks/useSnackbar";
import { useConfirmationDialog } from "@webiny/app-admin/hooks/useConfirmationDialog";
import { PaginationProp } from "@webiny/ui/List/DataList/types";
import { LIST_AGENCIES, DELETE_AGENCY } from "./graphql";
import { useTenancy } from "@webiny/app-tenancy/hooks/useTenancy";

/**
 * Contains essential data listing functionality - data querying and UI control.
 */

interface Agency {
    id: string;
    title: string;
    description: string;
    createdOn: string;
    [key: string]: any;
}

interface useAgenciesDataListHook {
    (): {
        agencies: Array<Agency>;
        loading: boolean;
        pagination: PaginationProp;
        refresh: () => void;
        setSort: (sort: string) => void;
        newAgency: () => void;
        editAgency: (id: string) => void;
        deleteAgency: (id: string) => void;
        currentAgencyId: string;
        switchTenant: (agency: Agency) => void;
    };
}

const reducer = (prev, next) => ({ ...prev, ...next });

export const useAgenciesDataList: useAgenciesDataListHook = () => {
    // Base state and UI React hooks.
    const { history } = useRouter();
    const { showSnackbar } = useSnackbar();
    const { showConfirmation } = useConfirmationDialog();
    const [variables, setVariables] = useReducer(reducer, {
        limit: undefined,
        after: undefined,
        before: undefined,
        sort: undefined
    });
    const { setTenant } = useTenancy();

    const searchParams = new URLSearchParams(location.search);
    const currentAgencyId = searchParams.get("id");

    // Queries and mutations.
    const listQuery = useQuery(LIST_AGENCIES, {
        variables,
        onError: e => showSnackbar(e.message)
    });

    const [deleteIt, deleteMutation] = useMutation(DELETE_AGENCY, {
        refetchQueries: [{ query: LIST_AGENCIES }]
    });

    const { data: agencies = [], meta = {} } = listQuery.loading
        ? {}
        : listQuery?.data?.agencies?.listAgencies || {};
    const loading = [listQuery, deleteMutation].some(item => item.loading);

    // Base CRUD actions - new, edit, and delete.
    const newAgency = useCallback(() => history.push("/agencies?new"), []);
    const editAgency = useCallback(id => {
        history.push(`/agencies?id=${id}`);
    }, []);

    const deleteAgency = useCallback(
        item => {
            showConfirmation(async () => {
                try {
                    await deleteIt({
                        variables: item
                    });

                    showSnackbar(`Agency "${item.title}" deleted.`);
                    if (currentAgencyId === item.id) {
                        history.push(`/agencies`);
                    }
                } catch (e) {
                    showSnackbar(e.message);
                }
            });
        },
        [currentAgencyId]
    );

    // Sorting.
    const setSort = useCallback(
        value => setVariables({ after: undefined, before: undefined, sort: value }),
        []
    );

    // Pagination metadata and controls.
    const setPreviousPage = useCallback(
        () => setVariables({ after: undefined, before: meta.before }),
        undefined
    );
    const setNextPage = useCallback(
        () => setVariables({ after: meta.after, before: undefined }),
        undefined
    );
    const setLimit = useCallback(
        value => setVariables({ after: undefined, before: undefined, limit: value }),
        []
    );

    const switchTenant = agency => {
        setTenant({ id: agency.id, name: agency.title });
    };

    const pagination: PaginationProp = {
        setPerPage: setLimit,
        perPageOptions: [10, 25, 50],
        setPreviousPage,
        setNextPage,
        hasPreviousPage: meta.before,
        hasNextPage: meta.after
    };

    return {
        agencies,
        loading,
        refresh: listQuery.refetch,
        pagination,
        setSort,
        newAgency,
        editAgency,
        deleteAgency,
        currentAgencyId,
        switchTenant
    };
};
