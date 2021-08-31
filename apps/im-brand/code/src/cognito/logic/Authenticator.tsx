import React, { useReducer, useEffect, useMemo } from "react";
import Auth from "@aws-amplify/auth";
import { ApolloClient } from "apollo-client";
import { useApolloClient } from "@apollo/react-hooks";
import { useSecurity } from "@webiny/app-security";
import { SecurityIdentity } from "@webiny/app-security/SecurityIdentity";

export type AuthState =
    | "signIn"
    | "signedIn"
    | "signedOut"
    | "signedUp"
    | "signUp"
    | "verifyContact"
    | "confirmSignIn"
    | "requireNewPassword"
    | "setNewPassword"
    | "TOTPSetup"
    | "confirmSignUp"
    | "forgotPassword";

export interface AuthData {
    [key: string]: any;
}

export interface AuthMessage {
    title: string;
    text: string;
    type: "success" | "info" | "warning" | "danger";
}

export interface AuthChangeState {
    (state: AuthState, data?: AuthData, message?: AuthMessage): Promise<void>;
}

export interface AuthContextValue {
    tenantId: string;
    authState: AuthState;
    authData: AuthData;
    changeState: AuthChangeState;
    checkingUser?: boolean;
    message: AuthMessage;
}

export interface AuthenticatorProps {
    getIdentityData(params: {
        client: ApolloClient<any>;
        payload: { [key: string]: any };
    }): Promise<{ [key: string]: any }>;
    children: React.ReactNode;
}

export const AuthenticatorContext = React.createContext<AuthContextValue>({} as any);

export const Authenticator = (props: AuthenticatorProps) => {
    const { setIdentity } = useSecurity();
    const client = useApolloClient();

    window["Auth"] = Auth;

    const [state, setState] = useReducer((prev, next) => ({ ...prev, ...next }), {
        authState: "signIn",
        authData: null,
        message: null,
        checkingUser: false,
        tenantId: process.env.REACT_APP_TENANT_ID
    });

    const checkUrl = async () => {
        const query = new URLSearchParams(window.location.search);
        const queryData: any = {};
        query.forEach((value, key) => (queryData[key] = value));
        const { state, ...params } = queryData;

        if (state) {
            await onChangeState(state, params);
            return;
        }
        return checkUser();
    };

    useEffect(() => {
        checkUrl();
    }, []);

    const checkUser = async () => {
        setState({ checkingUser: true });
        try {
            const cognitoUser = await Auth.currentSession();
            if (!cognitoUser) {
                await onChangeState("signIn");
                setState({ checkingUser: false });
            } else {
                await onChangeState("signedIn");
                setState({ checkingUser: false });
            }
        } catch (e) {
            console.log("error", e);
            setState({ checkingUser: false });
        }
    };

    const onChangeState = async (state, data = null, message: AuthMessage = null) => {
        setState({ message });

        if (state === state.authState) {
            return;
        }

        // Cognito states call this state with user data.
        if (state === "signedIn") {
            setState({ checkingUser: true });
            const user = await Auth.currentSession();
            window["Auth"] = Auth;
            window["user"] = await Auth.currentAuthenticatedUser();

            const { login, ...data } = await props.getIdentityData({
                client,
                payload: user.getIdToken().payload
            });

            setIdentity(
                new SecurityIdentity({
                    login,
                    ...data,
                    logout() {
                        Auth.signOut();
                        setIdentity(null);
                        setState({ authState: "signIn" });
                    }
                })
            );

            return setState({
                authState: state,
                checkingUser: false,
                authData: { idToken: user.getIdToken() }
            });
        }

        setState({ authState: state, authData: data });
    };

    // TODO: this is for demo purposes
    window["setTenant"] = id => setState({ tenantId: id });

    const value = useMemo(() => {
        return { ...state, changeState: onChangeState };
    }, [state]);

    return (
        <AuthenticatorContext.Provider value={value}>
            {props.children}
        </AuthenticatorContext.Provider>
    );
};
