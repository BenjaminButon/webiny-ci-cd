import { BrandEntity } from "../types";
import mdbid from "mdbid";
import { Brand } from "../entities";
import BrandsResolver from "./BrandsResolver";
import { createTenant } from "~/plugins/utils/createTenant";
import { TenantWithType } from "~/types";

/**
 * Contains base `createBrand`, `updateBrand`, and `deleteBrand` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement custom data validation and security-related checks.
 * https://www.webiny.com/docs/how-to-guides/webiny-cli/scaffolding/extend-graphql-api#essential-files
 */

export interface BrandAdmin {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface CreateBrandParams {
    data: {
        title: string;
        description?: string;
        admin: BrandAdmin;
    };
}

interface UpdateBrandParams {
    id: string;
    data: {
        title: string;
        description?: string;
    };
}

interface DeleteBrandParams {
    id: string;
}

interface BrandsMutation {
    createBrand(params: CreateBrandParams): Promise<BrandEntity>;
    updateBrand(params: UpdateBrandParams): Promise<BrandEntity>;
    deleteBrand(params: DeleteBrandParams): Promise<BrandEntity>;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class BrandsMutationResolver extends BrandsResolver implements BrandsMutation {
    /**
     * Creates and returns a new Brand entry.
     * @param data
     */
    async createBrand({ data }: CreateBrandParams) {
        const { security, tenancy } = this.context;
        const { admin, ...brandData } = data;

        // We use `mdbid` (https://www.npmjs.com/package/mdbid) library to generate
        // a random, unique, and sequential (sortable) ID for our new entry.
        const id = mdbid();

        const identity = await security.getIdentity();
        const brand = {
            ...brandData,
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
        await Brand.put(brand);

        /**
         * Here begins the process of tenant creation.
         * We need to insert a tenant record, create an `Administrator` user group for the new tenant, create a user,
         * and link the new admin user with the new tenant using this new user group.
         */
        const currentTenant = tenancy.getCurrentTenant();
        const tenant = {
            id: brand.id,
            name: brand.title,
            parent: currentTenant.id,
            type: "brand"
        };
        await createTenant({ tenant, user: admin, context: this.context });

        return brand;
    }

    /**
     * Updates and returns an existing Brand entry.
     * @param id
     * @param data
     */
    async updateBrand(params: UpdateBrandParams) {
        // If entry is not found, we throw an error.
        const { Item: brand } = await Brand.get({ PK: this.getPK(), SK: params.id });
        if (!brand) {
            throw new Error(`Brand "${params.id}" not found.`);
        }

        const updatedBrand = { ...brand, ...params.data };
        
        // Will throw an error if something goes wrong.
        await Brand.update(updatedBrand);

        // Update tenant name
        await this.context.tenancy.updateTenant(brand.id, { name: brand.title });

        return updatedBrand;
    }

    /**
     * Deletes and returns an existing Brand entry.
     * @param id
     */
    async deleteBrand({ id }: DeleteBrandParams) {
        // If entry is not found, we throw an error.
        const { Item: brand } = await Brand.get({ PK: this.getPK(), SK: id });
        if (!brand) {
            throw new Error(`Brand "${id}" not found.`);
        }

        // Will throw an error if something goes wrong.
        await Brand.delete(brand);

        return brand;
    }
}
