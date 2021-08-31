import React from "react";
import { DeleteIcon } from "@webiny/ui/List/DataList/icons";
import { ButtonIcon, ButtonSecondary } from "@webiny/ui/Button";
import { ReactComponent as AddIcon } from "@webiny/app-admin/assets/icons/add-18px.svg";
import { ReactComponent as SettingsIcon } from "./round-settings-24px.svg";
import {
    DataList,
    ScrollList,
    ListItem,
    ListItemText,
    ListItemMeta,
    ListActions,
    ListItemTextSecondary
} from "@webiny/ui/List";
import { useBrandsDataList } from "./hooks/useBrandsDataList";

/**
 * Renders a list of all Brand entries. Includes basic deletion, pagination, and sorting capabilities.
 * The data querying functionality is located in the `useBrandsDataList` React hook.
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

const BrandsDataList = () => {
    const {
        brands,
        loading,
        refresh,
        pagination,
        setSort,
        newBrand,
        editBrand,
        deleteBrand,
        currentBrandId,
        switchTenant
    } = useBrandsDataList();

    return (
        <DataList
            title={"Brands"}
            data={brands}
            loading={loading}
            refresh={refresh}
            pagination={pagination}
            sorters={sorters}
            setSorters={setSort}
            actions={
                <ButtonSecondary onClick={newBrand}>
                    <ButtonIcon icon={<AddIcon />} />
                    New Brand
                </ButtonSecondary>
            }
        >
            {({ data }) => (
                <ScrollList>
                    {data.map(item => (
                        <ListItem key={item.id} selected={item.id === currentBrandId}>
                            <ListItemText onClick={() => editBrand(item.id)}>
                                {item.title}
                                <ListItemTextSecondary>ID: {item.id}</ListItemTextSecondary>
                            </ListItemText>

                            <ListItemMeta>
                                <ListActions>
                                    <SettingsIcon onClick={() => switchTenant(item)} />
                                    <DeleteIcon onClick={() => deleteBrand(item)} />
                                </ListActions>
                            </ListItemMeta>
                        </ListItem>
                    ))}
                </ScrollList>
            )}
        </DataList>
    );
};

export default BrandsDataList;
