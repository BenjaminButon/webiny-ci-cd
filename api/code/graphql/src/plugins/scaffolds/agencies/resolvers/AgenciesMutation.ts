import mdbid from "mdbid";
import { Agency } from "../entities";
import AgenciesResolver from "./AgenciesResolver";
import { AgencyEntity } from "~/plugins/scaffolds/agencies/types";
import { createTenant } from "~/plugins/utils/createTenant";

/**
 * Contains base `createAgency`, `updateAgency`, and `deleteAgency` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement custom data validation and security-related checks.
 * https://www.webiny.com/docs/how-to-guides/webiny-cli/scaffolding/extend-graphql-api#essential-files
 */

export interface AgencyAdmin {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface CreateAgencyParams {
    data: {
        title: string;
        description?: string;
        admin: AgencyAdmin;
    };
}

interface UpdateAgencyParams {
    id: string;
    data: {
        title: string;
        description?: string;
    };
}

interface DeleteAgencyParams {
    id: string;
}

interface AgenciesMutation {
    createAgency(params: CreateAgencyParams): Promise<AgencyEntity>;
    updateAgency(params: UpdateAgencyParams): Promise<AgencyEntity>;
    deleteAgency(params: DeleteAgencyParams): Promise<AgencyEntity>;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class AgenciesMutationResolver extends AgenciesResolver implements AgenciesMutation {
    /**
     * Creates and returns a new Agency entry.
     * @param data
     */
    async createAgency({ data }: CreateAgencyParams) {
        const { security, tenancy } = this.context;
        const { admin, ...agencyData } = data;

        // We use `mdbid` (https://www.npmjs.com/package/mdbid) library to generate
        // a random, unique, and sequential (sortable) ID for our new entry.
        const id = mdbid();

        const identity = await security.getIdentity();
        const agency = {
            ...agencyData,
            PK: this.getPK(),
            SK: id,
            id,
            createdOn: new Date().toISOString(),
            savedOn: new Date().toISOString(),
            createdBy: identity && {
                id: identity.id,
                type: identity.type,
                displayName: identity.displayName
            },
            webinyVersion: process.env.WEBINY_VERSION
        };

        // Will throw an error if something goes wrong.
        await Agency.put(agency);

        /**
         * Here begins the process of tenant creation.
         * We need to insert a tenant record, create an `Administrator` user group for the new tenant, create a user,
         * and link the new admin user with the new tenant using this new user group.
         */
        const currentTenant = tenancy.getCurrentTenant();
        const tenant = {
            id: agency.id,
            name: agency.title,
            parent: currentTenant.id,
            type: "agency"
        };
        await createTenant({ tenant, user: admin, context: this.context });

        return agency;
    }

    /**
     * Updates and returns an existing Agency entry.
     * @param id
     * @param data
     */
    async updateAgency({ id, data }: UpdateAgencyParams) {
        // If entry is not found, we throw an error.
        const { Item: agency } = await Agency.get({ PK: this.getPK(), SK: id });
        if (!agency) {
            throw new Error(`Agency "${id}" not found.`);
        }

        const updatedAgency = { ...agency, ...data };

        // Will throw an error if something goes wrong.
        await Agency.update(updatedAgency);

        // Update tenant name
        await this.context.tenancy.updateTenant(agency.id, { name: agency.title });

        return updatedAgency;
    }

    /**
     * Deletes and returns an existing Agency entry.
     * @param id
     */
    async deleteAgency({ id }: DeleteAgencyParams) {
        // If entry is not found, we throw an error.
        const { Item: agency } = await Agency.get({ PK: this.getPK(), SK: id });
        if (!agency) {
            throw new Error(`Agency "${id}" not found.`);
        }

        // Will throw an error if something goes wrong.
        await Agency.delete(agency);

        return agency;
    }
}
