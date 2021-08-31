import React from "react";
import { SplitView, LeftPanel, RightPanel } from "@webiny/app-admin/components/SplitView";
import BrandsDataList from "./BrandsDataList";
import BrandsForm from "./BrandsForm";

/**
 * Main view component - renders data list and form.
 */

const BrandsView = () => {
    return (
        <SplitView>
            <LeftPanel>
                <BrandsDataList />
            </LeftPanel>
            <RightPanel>
                <BrandsForm />
            </RightPanel>
        </SplitView>
    );
};

export default BrandsView;
