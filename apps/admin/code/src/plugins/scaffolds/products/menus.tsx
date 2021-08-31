import React from "react";
import { ReactComponent as Icon } from "./assets/round-ballot-24px.svg";
import { MenuPlugin } from "@webiny/app-admin/plugins/MenuPlugin";
import { useTenancy } from "@webiny/app-tenancy/hooks/useTenancy";

/**
 * Registers "Products" main menu item.
 */
export default new MenuPlugin({
    render({ Menu, Item }) {
        const { tenant } = useTenancy<{ type: string }>();
        if (tenant.type === "brand") {
            return (
                <Menu name="menu-products" label={"Products"} icon={<Icon />}>
                    <Item label={"Products"} path={"/products"} />
                </Menu>
            );
        }

        return null;
    }
});
