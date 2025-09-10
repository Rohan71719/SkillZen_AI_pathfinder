import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <SignIn
      routing="path"               // ensures URL routing works with your app
      path="/sign-in"              // the route this component is mounted on
      signUpUrl="/sign-up"         // route to sign-up page
      fallbackRedirectUrl="/dashboard"      
    />
  );
};

export default SignInPage;
