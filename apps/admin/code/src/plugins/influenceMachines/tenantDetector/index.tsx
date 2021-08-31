import { useEffect } from "react";
import { default as localStorage } from "store";
import { TenantPlugin } from "@webiny/app-tenancy/plugins/TenantPlugin";
import { useTenancy } from "@webiny/app-tenancy/hooks/useTenancy";

const LOCAL_STORAGE_KEY = "webiny_tenant";

function loadState() {
    return localStorage.get(LOCAL_STORAGE_KEY) || null;
}

function storeState(state) {
    localStorage.set(LOCAL_STORAGE_KEY, state);
}

/**
 * This plugin works as a detector of the tenant that should be activated when the app starts.
 * If the tenantId is stored in localStorage, use that.
 *
 * Otherwise, check is user has access to `root` tenant.
 * If not, pick the first tenant that is available to this user.
 */
export default new TenantPlugin(() => {
    const tenancy = useTenancy();

    useEffect(() => {
        const activeTenantId = loadState();
        const tenant = tenancy.tenants.find(t => t.id === activeTenantId);
        if (tenant) {
            tenancy.setTenant(tenant);
        } else {
            // Try locating `root` tenant, in case user has access to it.
            const tenant = tenancy.tenants.find(t => t.id === "root") || tenancy.tenants[0];
            tenancy.setTenant(tenant);
            storeState(tenant.id);
        }

        tenancy.onChange(tenant => {
            storeState(tenant.id);
            // When switching tenants, we always want to load the dashboard.
            window.location.href = "/";
        });
    }, []);

    return null;
});
