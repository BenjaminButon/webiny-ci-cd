import { useSignedIn } from "../logic/hooks/useSignedIn";

const SignedIn = ({ children }) => {
    const { shouldRender } = useSignedIn();

    return shouldRender ? children : null;
};

export default SignedIn;
