import Error from "@webiny/error";
import { CreateUserInput } from "@webiny/api-security-admin-users/types";
import { AgencyAdmin } from "~/plugins/scaffolds/agencies/resolvers/AgenciesMutation";
import {Context, TenantWithType} from "~/types";
import { createDefaultGroups } from "./createDefaultGroups";

interface CreateAgencyTenantParams {
    tenant: TenantWithType;
    user: AgencyAdmin;
    context: Context;
}

export async function createTenant({ tenant, user, context }: CreateAgencyTenantParams) {
    const { security, tenancy } = context;

    const currentTenant = tenancy.getCurrentTenant();

    // Load File Manager settings from current tenant. We need to re-use the `srcPrefix` across tenants,
    // since all tenants use the same cloud infrastructure.
    console.log("get FM settings");
    const fmSettings = await context.fileManager.settings.getSettings();

    // Create a tenant
    console.log("create tenant");
    const newTenant = await tenancy.createTenant(tenant);

    // Temporarily switch to the new tenant, so that all subsequent database records are stored for this new tenant.
    console.log("set current tenant");
    tenancy.setCurrentTenant(newTenant);

    console.log("create user groups");
    let fullAccessGroup;
    try {
        // Create default groups
        const { fullAccessGroup: group } = await createDefaultGroups(context);
        fullAccessGroup = group;
    } catch (ex) {
        throw new Error("Could not create default groups.", "CREATE_DEFAULT_GROUPS_ERROR", {
            message: ex.message,
            code: ex.code,
            data: ex.data
        });
    }

    console.log("install I18N app");
    
    // Install default locale. This is necessary because Webiny operates in multi-locale mode in its core.
    // You don't need to use multiple locales, but you do need to have the default one installed.
    await context.i18n.system.install({ code: "en-US" });

    console.log("install File Manager app");
    // Install File Manager
    await context.fileManager.system.install({ srcPrefix: fmSettings.srcPrefix });

    console.log("create admin user");
    
    // Lastly, create the new tenant admin user.
    const userData: CreateUserInput & { password: string } = {
        login: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        group: fullAccessGroup.slug,
        // This field is necessary for Cognito plugin, which will forward it to the UserPool and then unset it from the
        // data, so it doesn't get stored into the database.
        password: user.password
    };
    try {
        // Create a new user. This user will be stored into the admin users UserPool.
        // See `api/pulumi/dev/cognito.ts` for UserPool configuration.
        const newUser = await security.users.createUser(userData, { auth: false });

        console.log("link user to tenant");
        await security.users.linkUserToTenant(newUser.login, newTenant, fullAccessGroup);

        console.log("mark security installed");
        // Store app version. This is NECESSARY to mark security as "installed" for the new tenant.
        await security.system.setVersion(context.WEBINY_VERSION);
    } catch (ex) {
        console.log("Create User", ex);

        // TODO: see if you want to throw an error here, revert everything, or just continue.
        // If user creation fails, it's not a big deal. The parent admin has access to the new tenant, and can create the user manually.
        // But it's up to your UX design to drive these decisions.
    }

    // In the end, switch back to original tenant
    tenancy.setCurrentTenant(currentTenant);
}
