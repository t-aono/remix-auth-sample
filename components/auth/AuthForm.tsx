import { useSearchParams, useActionData, Form } from "@remix-run/react";
import { Link } from "react-router-dom";

export default function AuthForm() {
  const [searchParams] = useSearchParams();
  const validationErrors = useActionData<string[]>();

  const authMode = searchParams.get("mode") || "login";
  const submitBtnCaption = authMode === "login" ? "Login" : "Create User";
  const toggleBtnCaption =
    authMode === "login" ? "Create a new user" : "Log in with existing user";

  return (
    <Form method="post" id="auth-form">
      <p>
        <label htmlFor="email">Email Address</label>
        <input type="email" id="email" name="email" required />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" minLength={7} />
      </p>
      {validationErrors && (
        <ul>
          {Object.values(validationErrors).map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <div>
        <button> {submitBtnCaption} </button>
      </div>
      <p>
        <Link to={authMode === "login" ? "?mode=signup" : "?mode=login"}>
          {toggleBtnCaption}
        </Link>
      </p>
    </Form>
  );
}
