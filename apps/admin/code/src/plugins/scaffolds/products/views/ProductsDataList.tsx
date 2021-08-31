import React from "react";
import { DeleteIcon } from "@webiny/ui/List/DataList/icons";
import { ButtonIcon, ButtonSecondary } from "@webiny/ui/Button";
import { ReactComponent as AddIcon } from "@webiny/app-admin/assets/icons/add-18px.svg";
import {
    DataList,
    ScrollList,
    ListItem,
    ListItemText,
    ListItemMeta,
    ListActions,
    ListItemTextSecondary
} from "@webiny/ui/List";
import { useProductsDataList } from "./hooks/useProductsDataList";

/**
 * Renders a list of all Product entries. Includes basic deletion, pagination, and sorting capabilities.
 * The data querying functionality is located in the `useProductsDataList` React hook.
 */

// By default, we are able to sort entries by time of creation (ascending and descending).
// More sorters can be added, but not that further adjustments will be needed on the GraphQL API side.
const sorters = [
    {
        label: "Newest to oldest",
        value: "createdOn_DESC"
    },
    {
        label: "Oldest to newest",
        value: "createdOn_ASC"
    }
];

const ProductsDataList = () => {
    const {
        products,
        loading,
        refresh,
        pagination,
        setSort,
        newProduct,
        editProduct,
        deleteProduct,
        currentProductId
    } = useProductsDataList();

    return (
        <DataList
            title={"Products"}
            data={products}
            loading={loading}
            refresh={refresh}
            pagination={pagination}
            sorters={sorters}
            setSorters={setSort}
            actions={
                <ButtonSecondary onClick={newProduct}>
                    <ButtonIcon icon={<AddIcon />} />
                    New Product
                </ButtonSecondary>
            }
        >
            {({ data }) => (
                <ScrollList>
                    {data.map(item => (
                        <ListItem key={item.id} selected={item.id === currentProductId}>
                            <ListItemText onClick={() => editProduct(item.id)}>
                                {item.title}
                                <ListItemTextSecondary>ID: {item.id}</ListItemTextSecondary>
                            </ListItemText>

                            <ListItemMeta>
                                <ListActions>
                                    <DeleteIcon onClick={() => deleteProduct(item)} />
                                </ListActions>
                            </ListItemMeta>
                        </ListItem>
                    ))}
                </ScrollList>
            )}
        </DataList>
    );
};

export default ProductsDataList;
