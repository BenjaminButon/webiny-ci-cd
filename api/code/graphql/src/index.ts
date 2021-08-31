import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { createHandler } from "@webiny/handler-aws";
import graphqlPlugins from "@webiny/handler-graphql";
import i18nPlugins from "@webiny/api-i18n/graphql";
import i18nDynamoDbStorageOperations from "@webiny/api-i18n-ddb";
import adminUsersPlugins from "@webiny/api-security-admin-users";
import securityAdminUsersDynamoDbStorageOperations from "@webiny/api-security-admin-users-so-ddb";
import i18nContentPlugins from "@webiny/api-i18n-content/plugins";
import dbPlugins from "@webiny/handler-db";
import { DynamoDbDriver } from "@webiny/db-dynamodb";
import dynamoDbPlugins from "@webiny/db-dynamodb/plugins";
import "@webiny/db-dynamodb/plugins";
import elasticsearchClientContextPlugin from "@webiny/api-elasticsearch";
import fileManagerPlugins from "@webiny/api-file-manager/plugins";
import fileManagerDynamoDbPlugins from "@webiny/api-file-manager-ddb";
import logsPlugins from "@webiny/handler-logs";
import fileManagerS3 from "@webiny/api-file-manager-s3";
// import pageBuilderPlugins from "@webiny/api-page-builder/graphql";
// import prerenderingServicePlugins from "@webiny/api-prerendering-service/client";
// import formBuilderPlugins from "@webiny/api-form-builder/plugins";
// import headlessCmsPlugins from "@webiny/api-headless-cms/plugins";
// import headlessCmsDynamoDbElasticStorageOperation from "@webiny/api-headless-cms-ddb-es";
// import elasticsearchDataGzipCompression from "@webiny/api-elasticsearch/plugins/GzipCompression";
import securityPlugins from "./security";
import customers from "./plugins/customers/customer.gql";
import adminUsers from "./plugins/admins/adminUsers.gql";

// Imports plugins created via scaffolding utilities.
import scaffoldsPlugins from "./plugins/scaffolds";

const debug = process.env.DEBUG === "true";

export const handler = createHandler({
    plugins: [
        logsPlugins(),
        graphqlPlugins({ debug }),
        elasticsearchClientContextPlugin({
            endpoint: `https://${process.env.ELASTIC_SEARCH_ENDPOINT}`
        }),
        dbPlugins({
            table: process.env.DB_TABLE,
            driver: new DynamoDbDriver({
                documentClient: new DocumentClient({
                    convertEmptyValues: true,
                    region: process.env.AWS_REGION
                })
            })
        }),
        dynamoDbPlugins(),
        securityPlugins(),
        i18nPlugins(),
        i18nDynamoDbStorageOperations(),
        i18nContentPlugins(),
        fileManagerPlugins(),
        fileManagerDynamoDbPlugins(),
        // Add File storage S3 plugin for API file manager.
        fileManagerS3(),
        // prerenderingServicePlugins({
        //     handlers: {
        //         render: process.env.PRERENDERING_RENDER_HANDLER,
        //         flush: process.env.PRERENDERING_FLUSH_HANDLER,
        //         queue: {
        //             add: process.env.PRERENDERING_QUEUE_ADD_HANDLER,
        //             process: process.env.PRERENDERING_QUEUE_PROCESS_HANDLER
        //         }
        //     }
        // }),
        adminUsersPlugins(),
        securityAdminUsersDynamoDbStorageOperations(),
        // pageBuilderPlugins(),
        // formBuilderPlugins(),
        // headlessCmsPlugins(),
        // headlessCmsDynamoDbElasticStorageOperation(),
        scaffoldsPlugins(),
        // elasticsearchDataGzipCompression(),
        customers,
        adminUsers
    ],
    http: { debug }
});
