import React, { Fragment } from "react";
import { Form } from "@webiny/form";
import { Grid, Cell } from "@webiny/ui/Grid";
import { Input } from "@webiny/ui/Input";
import { ButtonDefault, ButtonIcon, ButtonPrimary } from "@webiny/ui/Button";
import { CircularProgress } from "@webiny/ui/Progress";
import EmptyView from "@webiny/app-admin/components/EmptyView";
import { validation } from "@webiny/validation";
import { ReactComponent as AddIcon } from "@webiny/app-admin/assets/icons/add-18px.svg";
import {
    SimpleForm,
    SimpleFormFooter,
    SimpleFormContent,
    SimpleFormHeader
} from "@webiny/app-admin/components/SimpleForm";
import { useAgenciesForm } from "./hooks/useAgenciesForm";

/**
 * Renders a form which enables creating new or editing existing Agency entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useAgenciesForm` React hook.
 */
const AgenciesForm = () => {
    const { loading, emptyViewIsShown, currentAgency, cancelEditing, agency, onSubmit } =
        useAgenciesForm();

    // Render "No content" selected view.
    if (emptyViewIsShown) {
        return (
            <EmptyView
                title={"Click on the left side list to display Agencies details or create a..."}
                action={
                    <ButtonDefault onClick={currentAgency}>
                        <ButtonIcon icon={<AddIcon />} /> {"New Agency"}
                    </ButtonDefault>
                }
            />
        );
    }

    return (
        <Form data={agency} onSubmit={onSubmit}>
            {({ data, form, Bind }) => (
                <SimpleForm>
                    {loading && <CircularProgress />}
                    <SimpleFormHeader title={data.title || "New Agency"} />
                    <SimpleFormContent>
                        <Grid>
                            <Cell span={12}>
                                <Bind name="title" validators={validation.create("required")}>
                                    <Input label={"Title"} />
                                </Bind>
                            </Cell>
                            <Cell span={12}>
                                <Bind
                                    name="description"
                                    validators={validation.create("maxLength:500")}
                                >
                                    <Input
                                        label={"Description"}
                                        description={"Provide a short description here."}
                                        rows={4}
                                    />
                                </Bind>
                            </Cell>
                        </Grid>
                    </SimpleFormContent>
                    {data.id ? null : (
                        <Fragment>
                            <SimpleFormHeader title={"Create Agency User"} />
                            <SimpleFormContent>
                                <Grid>
                                    <Cell span={6}>
                                        <Bind
                                            name="admin.firstName"
                                            validators={validation.create("required")}
                                        >
                                            <Input label={"First name"} />
                                        </Bind>
                                    </Cell>
                                    <Cell span={6}>
                                        <Bind
                                            name="admin.lastName"
                                            validators={validation.create("required")}
                                        >
                                            <Input label={"Last name"} />
                                        </Bind>
                                    </Cell>
                                    <Cell span={6}>
                                        <Bind
                                            name="admin.email"
                                            validators={validation.create("required,email")}
                                        >
                                            <Input label={"Email"} />
                                        </Bind>
                                    </Cell>
                                    <Cell span={6}>
                                        <Bind
                                            name="admin.password"
                                            validators={validation.create("required,minLength:8")}
                                        >
                                            <Input label={"Password"} />
                                        </Bind>
                                    </Cell>
                                </Grid>
                            </SimpleFormContent>
                        </Fragment>
                    )}
                    <SimpleFormFooter>
                        <ButtonDefault onClick={cancelEditing}>Cancel</ButtonDefault>
                        <ButtonPrimary onClick={form.submit}>Save Agency</ButtonPrimary>
                    </SimpleFormFooter>
                </SimpleForm>
            )}
        </Form>
    );
};

export default AgenciesForm;
