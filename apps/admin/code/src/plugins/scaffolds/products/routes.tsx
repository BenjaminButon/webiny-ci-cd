import React, { Suspense, lazy } from "react";
import Helmet from "react-helmet";
import { Route } from "@webiny/react-router";
import { CircularProgress } from "@webiny/ui/Progress";
import { AdminLayout } from "@webiny/app-admin/components/AdminLayout";
import { RoutePlugin } from "@webiny/app/plugins/RoutePlugin";

/**
 * Registers new "/products" route.
 */

const Loader = ({ children, ...props }) => (
    <Suspense fallback={<CircularProgress />}>{React.cloneElement(children, props)}</Suspense>
);

const Products = lazy(() => import("./views"));

export default new RoutePlugin({
    route: (
        <Route
            path={"/products"}
            exact
            render={() => (
                <AdminLayout>
                    <Helmet>
                        <title>Products</title>
                    </Helmet>
                    <Loader>
                        <Products />
                    </Loader>
                </AdminLayout>
            )}
        />
    )
});
