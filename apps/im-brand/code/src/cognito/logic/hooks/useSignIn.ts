import { useCallback, useReducer } from "react";
import Auth from "@aws-amplify/auth";
import { useAuthenticator } from "./useAuthenticator";

interface SignIn {
    shouldRender: boolean;
    signIn(params: { username: string; password: string }): void;
    signInWith(provider: string): void;
    loading: boolean;
    error: Error;
}

export function useSignIn(): SignIn {
    const [state, setState] = useReducer((prev, next) => ({ ...prev, ...next }), {
        error: null,
        loading: false
    });
    const { authState, changeState, tenantId } = useAuthenticator();

    const checkContact = useCallback(
        user => {
            Auth.verifiedContact(user).then(data => {
                if (data.verified) {
                    changeState("signedIn", user);
                } else {
                    changeState("verifyContact", { ...user, ...data });
                }
            });
        },
        [changeState]
    );

    const signInWith = provider => {
        //Auth.federatedSignIn({ provider });

        const domain = "im-poc-v2.auth.eu-central-1.amazoncognito.com";
        window.location.href = [
            `https://${domain}/authorize?identity_provider=${provider}`,
            `response_type=token`,
            `client_id=${process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID}`,
            `redirect_uri=http://localhost:${process.env.REACT_APP_PORT}`,
            `state=${tenantId}`
        ].join("&");
    };

    const signIn = useCallback(
        async input => {
            const { username, password } = input;

            setState({ loading: true, error: null });

            const tenantUsername = `${username.toLowerCase()}_${tenantId}`;

            try {
                const user = await Auth.signIn(tenantUsername, password);
                setState({ loading: false });
                if (
                    user.challengeName === "SMS_MFA" ||
                    user.challengeName === "SOFTWARE_TOKEN_MFA"
                ) {
                    changeState("confirmSignIn", user);
                } else if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
                    changeState("requireNewPassword", user);
                } else if (user.challengeName === "MFA_SETUP") {
                    changeState("TOTPSetup", user);
                } else {
                    checkContact(user);
                }
            } catch (err) {
                console.log(err);
                setState({ loading: false });
                if (err.code === "UserNotConfirmedException") {
                    changeState("confirmSignUp", { username });
                } else if (err.code === "PasswordResetRequiredException") {
                    changeState("forgotPassword", { username, system: true });
                } else {
                    setState({ error: err });
                }
            }
        },
        [changeState, tenantId]
    );

    return {
        shouldRender: ["signIn", "signedOut", "signedUp"].includes(authState),
        signIn,
        signInWith,
        ...state
    };
}
