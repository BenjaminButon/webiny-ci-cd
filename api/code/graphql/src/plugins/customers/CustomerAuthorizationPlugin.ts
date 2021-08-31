import { AuthorizationPlugin } from "@webiny/api-security/plugins/AuthorizationPlugin";
import { Context } from "../../types";

/**
 * This plugin contains your logic for granting customers permissions.
 * Modify to fit your needs.
 */
export class CustomerAuthorizationPlugin extends AuthorizationPlugin {
    private _identityType: string;

    constructor({ identityType }: { identityType: string }) {
        super();
        this._identityType = identityType;
    }

    async getPermissions({ security, tenancy }: Context) {
        const tenant = tenancy.getCurrentTenant();
        if (!tenant) {
            return [];
        }

        const identity = security.getIdentity();

        if (identity && identity.type === this._identityType) {
            // For demo purposes, give customers full access permissions.
            // Permissions can also be loaded from a Security Group.
            // See "UserAuthorizationPlugin" for example of dynamic permissions:
            // https://github.com/webiny/webiny-js/blob/next/packages/api-security-admin-users/src/plugins/UserAuthorizationPlugin.ts
            return [{ name: "*" }];
        }

        // No permissions
        return [];
    }
}
