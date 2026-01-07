import { LogInForm } from "../LogInForm/LogInForm";
import { FadeIn } from "../FadeIn/FadeIn";

export function LogIn() {

  return (
    <FadeIn>
      <h1 className="d-none">LATIAS</h1>
      <LogInForm />
    </FadeIn>
  );
}
