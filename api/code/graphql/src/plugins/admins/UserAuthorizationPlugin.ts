import { SecurityPermission } from "@webiny/api-security/types";
import { AuthorizationPlugin } from "@webiny/api-security/plugins/AuthorizationPlugin";
import { TenantAccess } from "@webiny/api-security-admin-users/types";
import Error from "@webiny/error";
import { Context, TenantWithType } from "~/types";

export interface Config {
    identityType?: string;
}

const extractPermissions = (tenantAccess?: TenantAccess): SecurityPermission[] | null => {
    if (!tenantAccess || !tenantAccess.group || !tenantAccess.group.permissions) {
        return null;
    }
    return tenantAccess.group.permissions;
};

/**
 * This plugin is the main source of user's permissions for the API.
 * We're closely following the logic of `@webiny/api-security-admin-users` here, with addition of some IM specific stuff.
 * NOTE: you can implement your own admin users logic from scratch, if necessary.
 */
export class UserAuthorizationPlugin extends AuthorizationPlugin<Context> {
    private readonly _config: Config;

    constructor(config?: Config) {
        super();
        this._config = config || {};
    }

    async getPermissions(context: Context) {
        const { security, tenancy } = context;
        const identity = security.getIdentity();
        if (!identity || identity.type !== this._config.identityType) {
            return null;
        }

        // Authorization is performed on a specific tenant.
        const tenant = tenancy.getCurrentTenant<TenantWithType>();

        const user = await security.users.getUser(identity.id, { auth: false });

        if (!user) {
            throw new Error(`User "${identity.id}" was not found!`, "USER_NOT_FOUND", {
                id: identity.id
            });
        }

        // Load all user-to-tenant links. They contain information about tenant and group.
        const userAccess = await security.users.getUserAccess(user.login);
        // Find the access link for current tenant.
        const tenantAccess = userAccess.find(set => set.tenant.id === tenant.id);
        // Extract permissions for this tenant.
        const permissions = extractPermissions(tenantAccess);

        // If permissions are found for this tenant, we don't need to continue with the special logic.
        if (permissions) {
            return permissions;
        }

        // If permissions are not found, it's possible that the user has indirect permissions.
        // Example 1: a "root" user is also an admin on all agencies and brands.
        // Example 2: an "agency" user is also an admin on all of its "brands".

        const hasRootAccess = userAccess.find(set => set.tenant.id === "root");
        if (hasRootAccess) {
            return [{ name: "*" }];
        }

        // Last thing to check is the case when an "agency" user is trying to access a "brand".
        if (tenant.type === "brand") {
            // Check if current user has access to brand's parent, which is an agency.
            if (userAccess.find(set => set.tenant.id === tenant.parent)) {
                return [{ name: "*" }];
            }
        }

        return [];
    }
}
