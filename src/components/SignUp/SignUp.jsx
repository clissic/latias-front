import "./SignUp.css";
import { SignUpForm } from "../SignUpForm/SignUpForm";
import { FadeIn } from "../FadeIn/FadeIn";

export function SignUp() {
  return (
    <FadeIn>
      <div>
        <h1 className="d-none">LATIAS</h1>
        <SignUpForm />
      </div>
    </FadeIn>
  );
}
