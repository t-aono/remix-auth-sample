import { ActionFunctionArgs } from "@remix-run/node";
import AuthForm from "components/auth/AuthForm";
import { login, signup } from "data/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const authMode = searchParams.get("mode") || "login";

  const formData = await request.formData();
  const credentials = Object.fromEntries(formData) as {
    email: string;
    password: string;
  };

  try {
    if (authMode === "login") {
      return await login(credentials);
    } else {
      return await signup(credentials);
    }
  } catch (error: any) {
    if (error.status === 401) {
      return { credentials: error.message };
    }
    if (error.status === 422) {
      return { credentials: error.message };
    }
  }
}

export default function AuthPage() {
  return <AuthForm />;
}
