import React from "react";
import { SplitView, LeftPanel, RightPanel } from "@webiny/app-admin/components/SplitView";
import AgenciesDataList from "./AgenciesDataList";
import AgenciesForm from "./AgenciesForm";

/**
 * Main view component - renders data list and form.
 */

const AgenciesView = () => {
    return (
        <SplitView>
            <LeftPanel>
                <AgenciesDataList />
            </LeftPanel>
            <RightPanel>
                <AgenciesForm />
            </RightPanel>
        </SplitView>
    );
};

export default AgenciesView;
