import React from "react";
import { Menu, MenuItem } from "@webiny/ui/Menu";
import { ButtonPrimary, ButtonIcon } from "@webiny/ui/Button";
import { css } from "emotion";
import { UIViewPlugin } from "@webiny/app-admin/ui/UIView";
import { AdminView } from "@webiny/app-admin/ui/views/AdminView";
import { GenericElement } from "@webiny/app-admin/ui/elements/GenericElement";
import { ReactComponent as DoneIcon } from "./done-24px.svg";
import { useTenancy } from "@webiny/app-tenancy/hooks/useTenancy";
import { Tenant } from "@webiny/app-tenancy/contexts/Tenancy";

const menuList = css({
    width: 350,
    right: -220,
    left: "auto !important"
});

const buttonStyles = css({
    marginRight: 10
});

const typeLabels = {
    brand: "Brand",
    agency: "Agency"
};

interface TenantWithType extends Tenant {
    type: string;
}

const TenantSelector = () => {
    const { tenant: currentTenant, tenants, setTenant } = useTenancy<TenantWithType>();

    const label = typeLabels[currentTenant.type];

    if (tenants.length === 1) {
        return (
            <ButtonPrimary className={buttonStyles} flat>
                {label ? `${label}:` : null} {currentTenant.name}
            </ButtonPrimary>
        );
    }

    if (!currentTenant) {
        return null;
    }

    return (
        <Menu
            className={menuList}
            handle={
                <ButtonPrimary className={buttonStyles} flat>
                    {label ? `${label}:` : null} {currentTenant.name}
                </ButtonPrimary>
            }
        >
            {tenants.map(tenant => (
                <MenuItem key={tenant.id} onClick={() => setTenant(tenant)}>
                    <span style={{ minWidth: 35 }}>
                        {currentTenant.id === tenant.id && (
                            <ButtonIcon
                                icon={<DoneIcon style={{ color: "var(--mdc-theme-primary)" }} />}
                            />
                        )}
                    </span>
                    {tenant.name}&nbsp;
                    <span style={{ color: "rgba(0, 0, 0, 0.54)" }}>({tenant.type})</span>
                </MenuItem>
            ))}
        </Menu>
    );
};

export default new UIViewPlugin<AdminView>(AdminView, view => {
    const tenantSelector = new GenericElement("tenantSelector", () => <TenantSelector />);
    tenantSelector.moveToTheBeginningOf(view.getHeaderElement().getRightSection());
});
