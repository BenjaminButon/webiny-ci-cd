import { useCallback, useReducer } from "react";
import { useRouter } from "@webiny/react-router";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useSnackbar } from "@webiny/app-admin/hooks/useSnackbar";
import { useConfirmationDialog } from "@webiny/app-admin/hooks/useConfirmationDialog";
import { PaginationProp } from "@webiny/ui/List/DataList/types";
import { LIST_PRODUCTS, DELETE_PRODUCT } from "./graphql";

/**
 * Contains essential data listing functionality - data querying and UI control.
 */

interface useProductsDataListHook {
    (): {
        products: Array<{
            id: string;
            title: string;
            description: string;
            createdOn: string;
            [key: string]: any;
        }>;
        loading: boolean;
        pagination: PaginationProp;
        refresh: () => void;
        setSort: (sort: string) => void;
        newProduct: () => void;
        editProduct: (id: string) => void;
        deleteProduct: (id: string) => void;
        currentProductId: string;
    };
}

const reducer = (prev, next) => ({ ...prev, ...next });

export const useProductsDataList: useProductsDataListHook = () => {
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

    const searchParams = new URLSearchParams(location.search);
    const currentProductId = searchParams.get("id");

    // Queries and mutations.
    const listQuery = useQuery(LIST_PRODUCTS, {
        variables,
        onError: e => showSnackbar(e.message)
    });

    const [deleteIt, deleteMutation] = useMutation(DELETE_PRODUCT, {
        refetchQueries: [{ query: LIST_PRODUCTS }]
    });

    const { data: products = [], meta = {} } = listQuery.loading
        ? {}
        : listQuery?.data?.products?.listProducts || {};
    const loading = [listQuery, deleteMutation].some(item => item.loading);

    // Base CRUD actions - new, edit, and delete.
    const newProduct = useCallback(() => history.push("/products?new"), []);
    const editProduct = useCallback(id => {
        history.push(`/products?id=${id}`);
    }, []);

    const deleteProduct = useCallback(
        item => {
            showConfirmation(async () => {
                try {
                    await deleteIt({
                        variables: item
                    });

                    showSnackbar(`Product "${item.title}" deleted.`);
                    if (currentProductId === item.id) {
                        history.push(`/products`);
                    }
                } catch (e) {
                    showSnackbar(e.message);
                }
            });
        },
        [currentProductId]
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

    const pagination: PaginationProp = {
        setPerPage: setLimit,
        perPageOptions: [10, 25, 50],
        setPreviousPage,
        setNextPage,
        hasPreviousPage: meta.before,
        hasNextPage: meta.after
    };

    return {
        products,
        loading,
        refresh: listQuery.refetch,
        pagination,
        setSort,
        newProduct,
        editProduct,
        deleteProduct,
        currentProductId
    };
};
