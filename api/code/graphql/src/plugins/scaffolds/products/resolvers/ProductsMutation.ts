import { ProductEntity } from "../types";
import mdbid from "mdbid";
import { Product } from "../entities";
import ProductsResolver from "./ProductsResolver";
import ProductsQuery from "./ProductsQuery";

/**
 * Contains base `createProduct`, `updateProduct`, and `deleteProduct` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement custom data validation and security-related checks.
 * https://www.webiny.com/docs/how-to-guides/webiny-cli/scaffolding/extend-graphql-api#essential-files
 */

interface CreateProductParams {
    data: {
        title: string;
        description?: string;
    };
}

interface UpdateProductParams {
    id: string;
    data: {
        title: string;
        description?: string;
    };
}

interface DeleteProductParams {
    id: string;
}

interface PurchaseProductParams {
    brandId: string;
    productId: string;
}

interface ProductsMutation {
    createProduct(params: CreateProductParams): Promise<ProductEntity>;
    updateProduct(params: UpdateProductParams): Promise<ProductEntity>;
    deleteProduct(params: DeleteProductParams): Promise<ProductEntity>;
    purchaseProductFromBrand(params: PurchaseProductParams): Promise<boolean>;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class ProductsMutationResolver extends ProductsResolver implements ProductsMutation {
    /**
     * Creates and returns a new Product entry.
     * @param data
     */
    async createProduct({ data }: CreateProductParams) {
        const { security } = this.context;

        // We use `mdbid` (https://www.npmjs.com/package/mdbid) library to generate
        // a random, unique, and sequential (sortable) ID for our new entry.
        const id = mdbid();

        const identity = await security.getIdentity();
        const product = {
            ...data,
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
        await Product.put(product);

        return product;
    }

    /**
     * Updates and returns an existing Product entry.
     * @param id
     * @param data
     */
    async updateProduct({ id, data }: UpdateProductParams) {
        // If entry is not found, we throw an error.
        const { Item: product } = await Product.get({ PK: this.getPK(), SK: id });
        if (!product) {
            throw new Error(`Product "${id}" not found.`);
        }

        const updatedProduct = { ...product, ...data };

        // Will throw an error if something goes wrong.
        await Product.update(updatedProduct);

        return updatedProduct;
    }

    /**
     * Deletes and returns an existing Product entry.
     * @param id
     */
    async deleteProduct({ id }: DeleteProductParams) {
        // If entry is not found, we throw an error.
        const { Item: product } = await Product.get({ PK: this.getPK(), SK: id });
        if (!product) {
            throw new Error(`Product "${id}" not found.`);
        }

        // Will throw an error if something goes wrong.
        await Product.delete(product);

        return product;
    }

    async purchaseProductFromBrand({ brandId, productId }: PurchaseProductParams) {
        const { tenancy } = this.context;

        // Temporarily switch to brand tenant.
        const currentTenant = tenancy.getCurrentTenant();
        const brandTenant = await tenancy.getTenantById(brandId);
        tenancy.setCurrentTenant(brandTenant);

        // Ideally, your CRUD operations would live on the context object, for easier reuse.
        // Here we simply instantiate query resolvers to get access to product query methods.
        const productsQuery = new ProductsQuery(this.context);

        // Get product
        const product = await productsQuery.getProduct({ id: productId });

        // Restore original tenant.
        tenancy.setCurrentTenant(currentTenant);

        // Re-create the product within the brand tenant that initiated the purchase.
        await this.createProduct({ data: { title: product.title, description: product.description } });

        return true;
    }
}
