import { plugins } from "@webiny/plugins";
import routeNotFound from "./routeNotFound";
import basePlugins from "./base";
import apolloLinkPlugins from "./apolloLinks";
import securityPlugins from "./security";

// Imports plugins created via scaffolding utilities.
import scaffoldsPlugins from "./scaffolds";

plugins.register([
    /**
     * Base app plugins (files, images).
     */
    basePlugins,
    /**
     * ApolloClient link plugins.
     */
    apolloLinkPlugins,
    /**
     * Handles location paths that don't have a corresponding route.
     */
    routeNotFound,
    /**
     * Security app and authentication plugins.
     */
    securityPlugins,
    /**
     * Plugins created via scaffolding utilities.
     */
    scaffoldsPlugins()
]);
