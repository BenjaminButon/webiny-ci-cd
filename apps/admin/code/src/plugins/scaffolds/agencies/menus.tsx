import React from "react";
import { ReactComponent as Icon } from "./assets/round-ballot-24px.svg";
import { MenuPlugin } from "@webiny/app-admin/plugins/MenuPlugin";
import { useTenancy } from "@webiny/app-tenancy/hooks/useTenancy";

/**
 * Registers "Agencies" main menu item.
 */
export default new MenuPlugin({
    render({ Menu, Item }) {
        const { tenant } = useTenancy<{ type: string }>();
        if (tenant.type === "system") {
            return (
                <Menu name="menu-agencies" label={"Agencies"} icon={<Icon />}>
                    <Item label={"Agencies"} path={"/agencies"} />
                </Menu>
            );
        }

        return null;
    }
});
