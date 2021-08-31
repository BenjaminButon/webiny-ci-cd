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
    ListActions, ListItemTextSecondary
} from "@webiny/ui/List";
import { useAgenciesDataList } from "./hooks/useAgenciesDataList";

/**
 * Renders a list of all Agency entries. Includes basic deletion, pagination, and sorting capabilities.
 * The data querying functionality is located in the `useAgenciesDataList` React hook.
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

const AgenciesDataList = () => {
    const {
        agencies,
        loading,
        refresh,
        pagination,
        setSort,
        newAgency,
        editAgency,
        deleteAgency,
        currentAgencyId,
        switchTenant
    } = useAgenciesDataList();

    return (
        <DataList
            title={"Agencies"}
            data={agencies}
            loading={loading}
            refresh={refresh}
            pagination={pagination}
            sorters={sorters}
            setSorters={setSort}
            actions={
                <ButtonSecondary onClick={newAgency}>
                    <ButtonIcon icon={<AddIcon />} />
                    New Agency
                </ButtonSecondary>
            }
        >
            {({ data }) => (
                <ScrollList>
                    {data.map(item => (
                        <ListItem key={item.id} selected={item.id === currentAgencyId}>
                            <ListItemText onClick={() => editAgency(item.id)}>
                                {item.title}
                                <ListItemTextSecondary>ID: {item.id}</ListItemTextSecondary>
                            </ListItemText>

                            <ListItemMeta>
                                <ListActions>
                                    <SettingsIcon onClick={() => switchTenant(item)} />
                                    <DeleteIcon onClick={() => deleteAgency(item)} />
                                </ListActions>
                            </ListItemMeta>
                        </ListItem>
                    ))}
                </ScrollList>
            )}
        </DataList>
    );
};

export default AgenciesDataList;
