import invariant from "invariant";
import { startApp, buildApp } from "@webiny/project-utils";
import { getStackOutput } from "@webiny/cli-plugin-deploy-pulumi/utils";

const MAP = {
    REACT_APP_USER_POOL_REGION: "${region}",
    REACT_APP_GRAPHQL_API_URL: "${apiUrl}/graphql",
    REACT_APP_API_URL: "${apiUrl}",
    REACT_APP_USER_POOL_ID: "${cognitoUserPoolId}",
    REACT_APP_USER_POOL_WEB_CLIENT_ID: "${cognitoAppClientId}"
};

const NO_ENV_MESSAGE = `Please specify the environment via the "--env" argument, for example: "--env dev".`;
const NO_TENANT_ID_MESSAGE = `Please specify the tenant ID via the "--tenantId" argument.`;
const NO_API_MESSAGE = env => {
    return `It seems that the API project application isn't deployed!\nBefore continuing, please deploy it by running the following command: yarn webiny deploy api --env=${env}`;
};

export default {
    commands: {
        async start({ port, tenantId, ...options }, context) {
            invariant(options.env, NO_ENV_MESSAGE);
            invariant(tenantId, NO_TENANT_ID_MESSAGE);

            const output = await getStackOutput("api", options.env, MAP);
            invariant(output, NO_API_MESSAGE(options.env));

            Object.assign(output, {
                // The user pool for this PoC was created manually, so I'm hard coding the ID's here.
                REACT_APP_USER_POOL_ID: "eu-central-1_LnS7vBaqp",
                REACT_APP_USER_POOL_WEB_CLIENT_ID: "54qat1lqleppv2h8g09bpebs9p",
                // To simulate tenants, start the app with the following command:
                // yarn start --env=dev --tenantId=1
                REACT_APP_TENANT_ID: tenantId,
                REACT_APP_PORT: port || "3000",
                PORT: port || "3000"
            });

            Object.assign(process.env, output);

            // Start local development
            await startApp(options, context);
        },
        async build(options, context) {
            invariant(options.env, NO_ENV_MESSAGE);

            const output = await getStackOutput("api", options.env, MAP);
            invariant(output, NO_API_MESSAGE(options.env));

            Object.assign(process.env, output);

            // Bundle app for deployment
            await buildApp(options, context);
        }
    }
};
