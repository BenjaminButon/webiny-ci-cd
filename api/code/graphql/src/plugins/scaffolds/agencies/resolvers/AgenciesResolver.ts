import { Context } from "~/types";

export default class AgenciesResolver {
    protected readonly context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    /**
     * Generates primary key (PK), to be used upon mutating / querying DynamoDB data.
     * @param base
     */
    getPK(base = "Agency") {
        // By default, Webiny Admin Area supports content creation in multiple locales.
        // The prepended "L#${locale}" designates to which locale our data belongs to.
        // const locale = this.context.i18nContent.getLocale().code;
        // base = `L#${locale}#${base}`;

        // In integration test environments, we use the `process.env.TEST_RUN_ID` as a suffix.
        // This helps us isolate the created test data and perform assertions in our tests.
        if (process.env.TEST_RUN_ID) {
            base += "_TEST_RUN_" + process.env.TEST_RUN_ID;
        }

        // We must include current tenant ID, to be able to filter agencies that only belong
        // to the current tenant. In the case of Influence Machines, you're the top-level tenant,
        // and you could skip this. But it's a good practice to maintain the same PK patterns.
        return `T#${this.context.tenancy.getCurrentTenant().id}#${base}`;
    }
}
