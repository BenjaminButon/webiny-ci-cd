import * as React from "react";
import { Form } from "@webiny/form";
import { validation } from "@webiny/validation";
import { ButtonPrimary, ButtonSecondary } from "@webiny/ui/Button";
import { Input } from "@webiny/ui/Input";
import { Grid, Cell } from "@webiny/ui/Grid";
import { Typography } from "@webiny/ui/Typography";
import { Elevation } from "@webiny/ui/Elevation";
import { Alert } from "@webiny/ui/Alert";
import { CircularProgress } from "@webiny/ui/Progress";
import { useAuthenticator } from "../logic/hooks/useAuthenticator";
import { useSignIn } from "../logic/hooks/useSignIn";
import StateContainer from "./StateContainer";
import { alignRight, alignCenter, InnerContent, Title, errorMessage } from "./StyledComponents";

const SignIn = () => {
    const { message, changeState, checkingUser } = useAuthenticator();
    const { signIn, signInWith, loading, error, shouldRender } = useSignIn();

    if (!shouldRender || checkingUser) {
        return null;
    }

    return (
        <StateContainer>
            <Form onSubmit={signIn} submitOnEnter>
                {({ Bind, submit }) => (
                    <Elevation z={2}>
                        <InnerContent>
                            {loading && <CircularProgress />}
                            <Title>
                                <h1>
                                    <Typography use="headline4">Sign In</Typography>
                                </h1>
                            </Title>

                            {message && !error && (
                                <Grid>
                                    <Cell span={12}>
                                        <Alert title={message.title} type={message.type}>
                                            {message.text}
                                        </Alert>
                                    </Cell>
                                </Grid>
                            )}

                            {error && (
                                <Grid>
                                    <Cell span={12} className={errorMessage}>
                                        <Alert title="Authentication error" type={"danger"}>
                                            {error.message}
                                        </Alert>
                                    </Cell>
                                </Grid>
                            )}

                            <Grid>
                                <Cell span={12}>
                                    <Bind
                                        name="username"
                                        validators={validation.create("required")}
                                        beforeChange={(val, cb) => cb(val.toLowerCase())}
                                    >
                                        <Input label={"E-mail / Phone number"} />
                                    </Bind>
                                </Cell>
                                <Cell span={12}>
                                    <Bind
                                        name="password"
                                        validators={validation.create("required")}
                                    >
                                        <Input type={"password"} label={"Your password"} />
                                    </Bind>
                                </Cell>
                                <Cell span={6}>
                                    <ButtonSecondary onClick={() => signInWith("Facebook")}>
                                        {"Facebook"}
                                    </ButtonSecondary>
                                </Cell>
                                <Cell span={6} className={alignRight}>
                                    <ButtonPrimary
                                        data-testid="submit-sign-in-form-button"
                                        onClick={submit}
                                    >
                                        {"Submit"}
                                    </ButtonPrimary>
                                </Cell>
                                <Cell span={12} className={alignCenter}>
                                    <a href="#" onClick={() => changeState("forgotPassword")}>
                                        Forgot password?
                                    </a>
                                    &nbsp;|&nbsp;
                                    <a href="#" onClick={() => changeState("signUp")}>
                                        Create an account
                                    </a>
                                </Cell>
                            </Grid>
                        </InnerContent>
                    </Elevation>
                )}
            </Form>
        </StateContainer>
    );
};

export default SignIn;
