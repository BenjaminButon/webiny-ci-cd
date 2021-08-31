import React from "react";
import { Authenticator, AuthenticatorProps } from "./logic/Authenticator";
import SignIn from "./views/SignIn";
import SignUp from "./views/SignUp";
import RequireNewPassword from "./views/RequireNewPassword";
import ForgotPassword from "./views/ForgotPassword";
import SetNewPassword from "./views/SetNewPassword";
import SignedIn from "./views/SignedIn";
import CheckingUser from "./views/CheckingUser";

export type Props = AuthenticatorProps;

export const Authentication = ({ children, getIdentityData }: Props) => {
    return (
        <div>
            <Authenticator getIdentityData={getIdentityData}>
                <CheckingUser />
                <SignIn />
                <SignUp />
                <RequireNewPassword />
                <ForgotPassword />
                <SetNewPassword />
                <SignedIn>{children}</SignedIn>
            </Authenticator>
        </div>
    );
};
