import { SecurityIdentity } from "@webiny/api-security/types";

export interface AgencyEntity {
    PK: string;
    SK: string;
    id: string;
    title: string;
    description?: string;
    createdOn: string;
    savedOn: string;
    createdBy: Pick<SecurityIdentity, "id" | "displayName" | "type">;
    webinyVersion: string;
}
