# 1. Project Setup

> NOTE: every developer must do it on his own machine

1. Clone the repo
2. Run `yarn` to install dependencies
3. `yarn setup-project` to prepare `.env` files, etc.

# 2. PoC Setup

1. Manually create a Cognito User Pool for the customers (see attached screenshots in the [./resources](./resources) folder), and insert UserPoolID into the [authentication plugin configuration](./api/code/graphql/src/security.ts#L88). _Our strong recommendation is to dedicate a few hours, and create a proper Pulumi configuration for this user pool. See [api/pulumi/dev/cognito.ts](./api/pulumi/dev/cognito.ts) for an example of the Admin User Pool, and create a second user pool following the same approach._
2. Deploy API (`yarn webiny deploy api --env=dev`).
3. If UserPool is created manually, via AWS console, insert the UserPool and App Client IDs in [apps/im-brand/code/webiny.config.ts#L30](./apps/im-brand/code/webiny.config.ts#L30)
4. Start `admin` app and complete the setup wizard (`cd apps/admin/code && yarn start --env=dev`).
5. If UserPool is created via Pulumi (highly recommended for production), use the variable map [apps/im-brand/code/webiny.config.ts#L5](./apps/im-brand/code/webiny.config.ts#L5) to point to the correct Pulumi stack output variables.

To start brand/school app simulation:

```shell
cd apps/im-brand/code
yarn start --env=dev --tenantId={insert-brand-id-here} --port={any-port-you-wish}
```

> NOTE: the `--port` must match one of the ports in the Cognito User Pool callback URLs, for social login to work.

## References of Interest

- Customers authentication plugins: [api/code/graphql/src/security.ts#L85](./api/code/graphql/src/security.ts#L85)
- tenant `type` is assigned in [AgenciesMutation](./api/code/graphql/src/plugins/scaffolds/agencies/resolvers/AgenciesMutation.ts#L93) and [BrandsMutation](./api/code/graphql/src/plugins/scaffolds/brands/resolvers/BrandsMutation.ts#L94) class
- when you extend GraphQL API using Webiny CLI scaffolds, DynamoDB partition keys are configured to be multi-locale, and single-tenant. Make sure you modify that manually. See [api/code/graphql/src/plugins/scaffolds/brands/resolvers/BrandsResolver.ts#L14](./api/code/graphql/src/plugins/scaffolds/brands/resolvers/BrandsResolver.ts#L14) for example.
- Admin-specific plugins: [api/code/graphql/src/plugins/admins](./api/code/graphql/src/plugins/admins)
- Customer-specific plugins: [api/code/graphql/src/plugins/customers](./api/code/graphql/src/plugins/customers)

## Useful Docs
- [Managing State Files](https://www.webiny.com/docs/key-topics/ci-cd/cloud-infrastructure-state-files)
