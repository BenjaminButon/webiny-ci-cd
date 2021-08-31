/**
 * The only purpose of this trigger is to auto-confirm the user upon signup, and auto-verify his email/phone.
 * You can, of course, not do it, and instead send a verification code/email.
 * For this PoC we do it the simple way, as it doesn't affect the overall setup.
 */
exports.handler = (event, context, callback) => {
    // Confirm the user
    event.response.autoConfirmUser = true;

    // Set the email as verified if it is in the request
    if (event.request.userAttributes.hasOwnProperty("email")) {
        event.response.autoVerifyEmail = true;
    }

    // Set the phone number as verified if it is in the request
    if (event.request.userAttributes.hasOwnProperty("phone_number")) {
        event.response.autoVerifyPhone = true;
    }

    // Return to Amazon Cognito
    callback(null, event);
};
