import { DbContext } from "@webiny/handler-db/types";
import { TenancyContext, Tenant } from "@webiny/api-tenancy/types";
import { AdminUsersContext } from "@webiny/api-security-admin-users/types";
import { I18NContext } from "@webiny/api-i18n/types";
import { FileManagerContext } from "@webiny/api-file-manager/types";

export interface PurchasedProduct {
    productId: string;
    datePurchased: string;
}

interface CustomerCRUD {
    purchaseProduct(productId: string): Promise<boolean>;
    getPurchasedProducts(): Promise<PurchasedProduct[]>;
}

export interface Context extends DbContext, FileManagerContext, I18NContext, TenancyContext {
    security: FileManagerContext["security"] & AdminUsersContext["security"];
    customers: CustomerCRUD;
}

export interface Customer {
    PK: string;
    SK: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface TenantWithType extends Tenant {
    type: string;
}
