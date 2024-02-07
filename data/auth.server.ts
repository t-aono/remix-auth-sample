import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
const { hash, compare } = bcrypt;
import fs from "fs";
import { User } from "types/user.type";

const SESSION_SECRET = process.env.SESSION_SECRET!;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
  },
});

async function createUserSession(userId: number, redirectPath: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return redirect(redirectPath, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function getUserFromSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const userId: string = session.get("userId");

  if (!userId) {
    return null;
  }

  return userId;
}

export async function requireUserSession(request: Request) {
  const userId = await getUserFromSession(request);

  if (!userId) {
    throw redirect("/auth?mode=login");
  }

  return userId;
}

export async function signup({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const users: User[] = JSON.parse(fs.readFileSync("user.json").toString());
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    const error: any = new Error(
      "A user with the provided email address exists already."
    );
    error.status = 422;
    throw error;
  }

  const passwordHash = await hash(password, 12);

  fs.writeFileSync(
    "user.json",
    JSON.stringify([...users, { email: email, password: passwordHash }])
  );

  return await createUserSession(users.length + 1, "/");
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const users: User[] = JSON.parse(fs.readFileSync("user.json").toString());
  const userIndex = users.findIndex((user) => user.email === email);
  const existingUser = users[userIndex];

  if (!existingUser) {
    const error: any = new Error(
      "Could not log you in, please check the provided email."
    );
    error.status = 401;
    throw error;
  }

  const passwordCorrect = await compare(password, existingUser.password);

  if (!passwordCorrect) {
    const error: any = new Error(
      "Could not log you in, please check the provided password."
    );
    error.status = 401;
    throw error;
  }

  return createUserSession(userIndex + 1, "/");
}
