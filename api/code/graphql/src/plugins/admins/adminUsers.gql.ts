import flatten from "lodash.flatten";
import { GraphQLSchemaPlugin } from "@webiny/handler-graphql/plugins";
import { Context, TenantWithType } from "~/types";
import { User } from "@webiny/api-security-admin-users/types";
import resolvers from "~/plugins/scaffolds/agencies/resolvers";

export default [
    new GraphQLSchemaPlugin<Context>({
        typeDefs: /* GraphQL */ `
            extend type TenantAccess {
                type: String!
            }
        `,
        resolvers: {
            TenantAccess: {
                async name({ id }, args, context) {
                    // Get tenant name from actual tenant record. Link records contain the name of the tenant
                    // at the time of link creation. Brand/Agency name can change, but we don't want to
                    // update all the links all the time. It's easier to just fetch the tenant name from the Tenant record.
                    const tenant = await context.tenancy.getTenantById<TenantWithType>(id);
                    return tenant.name;
                },
                async type({ id }, args, context) {
                    // Get tenant type. Internally tenants are loaded via DataLoader, so all calls will be aggregated
                    // into a single batch query to Dynamo DB.
                    const tenant = await context.tenancy.getTenantById<TenantWithType>(id);
                    if (tenant.id === "root") {
                        return "system";
                    }

                    return tenant.type;
                }
            },
            SecurityIdentity: {
                async access(user: User, args, context) {
                    // This section is borrowed from the `@webiny/api-security-admin-users` package.
                    const access = await context.security.users.getUserAccess(user.login);
                    const linkedAccess = access.map(item => ({
                        id: item.tenant.id,
                        name: item.tenant.name,
                        permissions: item.group.permissions
                    }));

                    // The following part is custom logic to dynamically generate access rules for React app.
                    // NOTE: this `access` array of rules is ONLY necessary for React app. API doesn't use it.
                    
                    // ! WARNING !
                    // With large amount of tenants, this array may become HUGE. Once that happens, you may
                    // need to rethink the UI, and how you verify if the user can access sub-tenants
                    // in the admin app.

                    // Load tenants this user has access to by hierarchy (without links in the DB).
                    const hasRootAccess = linkedAccess.find(item => item.id === "root");
                    if (hasRootAccess) {
                        // Load agencies
                        const agenciesResolver = new resolvers.AgenciesQuery(context);
                        const { data: agencies } = await agenciesResolver.listAgencies({
                            limit: 1000
                        });

                        return [
                            ...linkedAccess,
                            ...agencies.map(agency => ({
                                id: agency.id,
                                name: agency.title,
                                // Give root users full-access permissions on agencies.
                                // Modify this to fit your business and permissions logic.
                                permissions: [{ name: "*" }]
                            }))
                        ];
                    }

                    // Check what types of tenants this user has access to.
                    // NOTE: we will optimize user-to-tenant linking in the core of Webiny in the near future, and
                    // with that, this step might not be necessary at all.
                    const tenants = await Promise.all(
                        linkedAccess.map(link =>
                            context.tenancy.getTenantById<TenantWithType>(link.id)
                        )
                    );

                    // Find "agency" tenants.
                    const agencies = tenants.filter(item => item.type === "agency");
                    if (agencies.length) {
                        // Get agency sub-tenants
                        const brandTenants = await Promise.all(
                            agencies.map(agency =>
                                context.tenancy.listTenants<TenantWithType>({ parent: agency.id })
                            )
                        );

                        return [
                            ...linkedAccess,
                            ...flatten(brandTenants).map(brand => ({
                                id: brand.id,
                                name: brand.title,
                                // Give agency users full-access permissions on brands.
                                // Modify this to fit your business and permissions logic.
                                permissions: [{ name: "*" }]
                            }))
                        ];
                    }

                    // Return only the default access defined by `linkUserToTenant`.
                    // See: `api/code/graphql/src/plugins/utils/createTenant.ts:62`
                    return linkedAccess;
                }
            }
        }
    })
];
