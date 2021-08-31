import { AdminUsersContext, CrudOptions, Group } from "@webiny/api-security-admin-users/types";

export const createDefaultGroups = async (
    context: AdminUsersContext
): Promise<Record<"fullAccessGroup" | "anonymousGroup", Group>> => {
    let anonymousGroup: Group = null;
    let fullAccessGroup: Group = null;

    const options: CrudOptions = {
        auth: false
    };

    const groups = await context.security.groups.listGroups(options);

    groups.forEach(group => {
        if (group.slug === "full-access") {
            fullAccessGroup = group;
        }

        if (group.slug === "anonymous") {
            anonymousGroup = group;
        }
    });

    if (!fullAccessGroup) {
        fullAccessGroup = await context.security.groups.createGroup(
            {
                name: "Full Access",
                description: "Grants full access to all apps.",
                system: true,
                slug: "full-access",
                permissions: [{ name: "*" }]
            },
            options
        );
    }

    if (!anonymousGroup) {
        anonymousGroup = await context.security.groups.createGroup(
            {
                name: "Anonymous",
                description: "Permissions for anonymous users (public access).",
                system: true,
                slug: "anonymous",
                permissions: []
            },
            options
        );
    }

    return { fullAccessGroup, anonymousGroup };
};
