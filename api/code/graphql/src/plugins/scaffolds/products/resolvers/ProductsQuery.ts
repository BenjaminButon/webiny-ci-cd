import { ProductEntity } from "../types";
import { Product } from "../entities";
import ProductsResolver from "./ProductsResolver";

/**
 * Contains base `getProduct` and `listProducts` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement security-related checks.
 * https://www.webiny.com/docs/how-to-guides/webiny-cli/scaffolding/extend-graphql-api#essential-files
 */

interface GetProductParams {
    id: string;
}

interface ListProductsParams {
    sort?: "createdOn_ASC" | "createdOn_DESC";
    limit?: number;
    after?: string;
    before?: string;
}

interface ListProductsResponse {
    data: ProductEntity[];
    meta: { limit: number; after: string; before: string };
}

interface ProductsQuery {
    getProduct(params: GetProductParams): Promise<ProductEntity>;
    listProducts(params: ListProductsParams): Promise<ListProductsResponse>;
    listPublicProducts(): Promise<ListProductsResponse>;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class ProductsQueryResolver extends ProductsResolver implements ProductsQuery {
    /**
     * Returns a single Product entry from the database.
     * @param id
     */
    async getProduct({ id }: GetProductParams) {
        // Query the database and return the entry. If entry was not found, an error is thrown.
        const { Item: product } = await Product.get({ PK: this.getPK(), SK: id });
        if (!product) {
            throw new Error(`Product "${id}" not found.`);
        }

        return product;
    }

    /**
     * List multiple Product entries from the database.
     * Supports basic sorting and cursor-based pagination.
     * @param limit
     * @param sort
     * @param after
     * @param before
     */
    async listProducts({ limit = 10, sort, after, before }: ListProductsParams) {
        const PK = this.getPK();
        const query = { limit, reverse: sort !== "createdOn_ASC", gt: undefined, lt: undefined };
        const meta = { limit, after: null, before: null };

        // The query is constructed differently, depending on the "before" or "after" values.
        if (before) {
            query.reverse = !query.reverse;
            if (query.reverse) {
                query.lt = before;
            } else {
                query.gt = before;
            }

            const { Items } = await Product.query(PK, { ...query, limit: limit + 1 });

            const data = Items.slice(0, limit).reverse();

            const hasBefore = Items.length > limit;
            if (hasBefore) {
                meta.before = Items[Items.length - 1].id;
            }

            meta.after = Items[0].id;

            return { data, meta };
        }

        if (after) {
            if (query.reverse) {
                query.lt = after;
            } else {
                query.gt = after;
            }
        }

        const { Items } = await Product.query(PK, { ...query, limit: limit + 1 });

        const data = Items.slice(0, limit);

        const hasAfter = Items.length > limit;
        if (hasAfter) {
            meta.after = Items[limit - 1].id;
        }

        if (after) {
            meta.before = Items[0].id;
        }

        return { data, meta };
    }

    async listPublicProducts() {
        const { data, meta } = await this.listProducts({ limit: 100 });
        
        // Augment with customer's info
        const purchasedProducts = await this.context.customers.getPurchasedProducts();
        const augmentedData = data.map(product => {
            const purchased = purchasedProducts.find(pp => pp.productId === product.id);

            if (purchased) {
                product.purchased = true;
                product.datePurchased = purchased.datePurchased;
            } else {
                product.purchased = false;
                product.datePurchased = null;
            }

            return product;
        });

        return { data: augmentedData, meta };
    }
}
