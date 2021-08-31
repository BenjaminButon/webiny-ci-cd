import React from "react";
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
import { useProductsForm } from "./hooks/useProductsForm";

/**
 * Renders a form which enables creating new or editing existing Product entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useProductsForm` React hook.
 */
const ProductsForm = () => {
    const { loading, emptyViewIsShown, currentProduct, cancelEditing, product, onSubmit } =
        useProductsForm();

    // Render "No content" selected view.
    if (emptyViewIsShown) {
        return (
            <EmptyView
                title={"Click on the left side list to display Products details or create a..."}
                action={
                    <ButtonDefault onClick={currentProduct}>
                        <ButtonIcon icon={<AddIcon />} /> {"New Product"}
                    </ButtonDefault>
                }
            />
        );
    }

    return (
        <Form data={product} onSubmit={onSubmit}>
            {({ data, form, Bind }) => (
                <SimpleForm>
                    {loading && <CircularProgress />}
                    <SimpleFormHeader title={data.title || "New Product"} />
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
                    <SimpleFormFooter>
                        <ButtonDefault onClick={cancelEditing}>Cancel</ButtonDefault>
                        <ButtonPrimary onClick={form.submit}>Save Product</ButtonPrimary>
                    </SimpleFormFooter>
                </SimpleForm>
            )}
        </Form>
    );
};

export default ProductsForm;
