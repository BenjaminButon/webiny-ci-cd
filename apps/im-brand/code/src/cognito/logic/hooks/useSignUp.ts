import { useReducer } from "react";
import Auth from "@aws-amplify/auth";
import { useAuthenticator } from "./useAuthenticator";

interface SignUpParams {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface SignUp {
    shouldRender: boolean;
    signUp(params: SignUpParams): void;
    loading: boolean;
    error: Error;
}

export function useSignUp(): SignUp {
    const [state, setState] = useReducer((prev, next) => ({ ...prev, ...next }), {
        error: null,
        loading: false
    });
    const { authState, changeState, tenantId } = useAuthenticator();

    const signUp = async (params: SignUpParams) => {
        setState({ loading: true });
        const { username, password, firstName, lastName } = params;

        const isEmail = username.includes("@");
        const tenantUsername = `${username}_${tenantId}`;

        const attributes = {
            given_name: firstName,
            family_name: lastName
        };

        if (isEmail) {
            attributes["email"] = username;
        } else {
            attributes["phone_number"] = username;
        }

        try {
            const res = await Auth.signUp({
                username: tenantUsername,
                password,
                attributes
            });

            console.log("signUp response", res);

            changeState("signIn", res.user);
        } catch (error) {
            console.log("error signing up:", error);
            setState({ error });
        } finally {
            setState({ loading: false });
        }
    };

    return {
        shouldRender: ["signUp"].includes(authState),
        signUp,
        ...state
    };
}
