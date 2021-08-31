import React from "react";
import { SplitView, LeftPanel, RightPanel } from "@webiny/app-admin/components/SplitView";
import ProductsDataList from "./ProductsDataList";
import ProductsForm from "./ProductsForm";

/**
 * Main view component - renders data list and form.
 */

const ProductsView = () => {
    return (
        <SplitView>
            <LeftPanel>
                <ProductsDataList />
            </LeftPanel>
            <RightPanel>
                <ProductsForm />
            </RightPanel>
        </SplitView>
    );
};

export default ProductsView;
