import React from "react";
import { Route, Switch } from "@webiny/react-router";
import { ApolloProvider } from "@apollo/react-components";
import { SecurityProvider } from "@webiny/app-security";
import { BrowserRouter } from "@webiny/react-router";
import { Authentication } from "./cognito/Authentication";
import { createApolloClient } from "./components/apolloClient";
import { getIdentityData } from "./components/getIdentityData";
import { Dashboard } from "./Dashboard";

// Import styles which include custom theme styles
import "./App.scss";

export const App = () => (
    <ApolloProvider client={createApolloClient({ uri: process.env.REACT_APP_GRAPHQL_API_URL })}>
        {/*
            <SecurityProvider> is a generic provider of identity information. 3rd party identity providers (like Cognito,
            Okta, Auth0) will handle the authentication, and set the information about the user into this provider,
            so other parts of the system have a centralized place to fetch user information from.
        */}
        <SecurityProvider>
            {/*
                "@webiny/react-router" is an enhanced version of "react-router" to add some capabilities specific to Webiny.
                It's only necessary for apps prerendered with Webiny Prerendering Service.
            */}
            <BrowserRouter basename={process.env.PUBLIC_URL}>
                <Authentication getIdentityData={getIdentityData}>
                    <Switch>
                        <Route exact path={"/"} component={Dashboard} />
                    </Switch>
                </Authentication>
            </BrowserRouter>
        </SecurityProvider>
    </ApolloProvider>
);
