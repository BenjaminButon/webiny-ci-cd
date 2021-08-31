import React from "react";
import { ReactComponent as Icon } from "./assets/round-ballot-24px.svg";
import { MenuPlugin } from "@webiny/app-admin/plugins/MenuPlugin";
import { useTenancy } from "@webiny/app-tenancy/hooks/useTenancy";

/**
 * Registers "Brands" main menu item.
 */
export default new MenuPlugin({
    render({ Menu, Item }) {
        const { tenant } = useTenancy<{ type: string }>();
        if (tenant.type === "agency") {
            return (
                <Menu name="menu-brands" label={"Brands"} icon={<Icon />}>
                    <Item label={"Brands"} path={"/brands"} />
                </Menu>
            );
        }
        return null;
    }
});
