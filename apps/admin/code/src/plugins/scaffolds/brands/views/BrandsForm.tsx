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
import { useBrandsForm } from "./hooks/useBrandsForm";

/**
 * Renders a form which enables creating new or editing existing Brand entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useBrandsForm` React hook.
 */
const BrandsForm = () => {
    const { loading, emptyViewIsShown, currentBrand, cancelEditing, brand, onSubmit } =
        useBrandsForm();

    // Render "No content" selected view.
    if (emptyViewIsShown) {
        return (
            <EmptyView
                title={"Click on the left side list to display Brands details or create a..."}
                action={
                    <ButtonDefault onClick={currentBrand}>
                        <ButtonIcon icon={<AddIcon />} /> {"New Brand"}
                    </ButtonDefault>
                }
            />
        );
    }

    return (
        <Form data={brand} onSubmit={onSubmit}>
            {({ data, form, Bind }) => (
                <SimpleForm>
                    {loading && <CircularProgress />}
                    <SimpleFormHeader title={data.title || "New Brand"} />
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
                            <SimpleFormHeader title={"Create Brand User"} />
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
                        <ButtonPrimary onClick={form.submit}>Save Brand</ButtonPrimary>
                    </SimpleFormFooter>
                </SimpleForm>
            )}
        </Form>
    );
};

export default BrandsForm;
