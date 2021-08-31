import { useCallback, useReducer } from "react";
import { useRouter } from "@webiny/react-router";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useSnackbar } from "@webiny/app-admin/hooks/useSnackbar";
import { useConfirmationDialog } from "@webiny/app-admin/hooks/useConfirmationDialog";
import { PaginationProp } from "@webiny/ui/List/DataList/types";
import { LIST_BRANDS, DELETE_BRAND } from "./graphql";
import { useTenancy } from "@webiny/app-tenancy/hooks/useTenancy";

/**
 * Contains essential data listing functionality - data querying and UI control.
 */

interface Brand {
    id: string;
    title: string;
    description: string;
    createdOn: string;
    [key: string]: any;
}

interface useBrandsDataListHook {
    (): {
        brands: Array<Brand>;
        loading: boolean;
        pagination: PaginationProp;
        refresh: () => void;
        setSort: (sort: string) => void;
        newBrand: () => void;
        editBrand: (id: string) => void;
        deleteBrand: (id: string) => void;
        currentBrandId: string;
        switchTenant: (brand: Brand) => void;
    };
}

const reducer = (prev, next) => ({ ...prev, ...next });

export const useBrandsDataList: useBrandsDataListHook = () => {
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
    const currentBrandId = searchParams.get("id");

    // Queries and mutations.
    const listQuery = useQuery(LIST_BRANDS, {
        variables,
        onError: e => showSnackbar(e.message)
    });

    const [deleteIt, deleteMutation] = useMutation(DELETE_BRAND, {
        refetchQueries: [{ query: LIST_BRANDS }]
    });

    const { data: brands = [], meta = {} } = listQuery.loading
        ? {}
        : listQuery?.data?.brands?.listBrands || {};
    const loading = [listQuery, deleteMutation].some(item => item.loading);

    // Base CRUD actions - new, edit, and delete.
    const newBrand = useCallback(() => history.push("/brands?new"), []);
    const editBrand = useCallback(id => {
        history.push(`/brands?id=${id}`);
    }, []);

    const deleteBrand = useCallback(
        item => {
            showConfirmation(async () => {
                try {
                    await deleteIt({
                        variables: item
                    });

                    showSnackbar(`Brand "${item.title}" deleted.`);
                    if (currentBrandId === item.id) {
                        history.push(`/brands`);
                    }
                } catch (e) {
                    showSnackbar(e.message);
                }
            });
        },
        [currentBrandId]
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

    const switchTenant = brand => {
        setTenant({ id: brand.id, name: brand.title });
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
        brands,
        loading,
        refresh: listQuery.refetch,
        pagination,
        setSort,
        newBrand,
        editBrand,
        deleteBrand,
        currentBrandId,
        switchTenant
    };
};
