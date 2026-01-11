import { API_BASE_URL } from "@/config/constants";
import { AuthResponse } from "@/types/types";
import { EmailSchema, LoginSchema, SignupSchema } from "@monorepo/shared";
import { http, HttpRequestResolverExtras, HttpResponse, PathParams, ResponseResolver } from "msw";

const loginUrl = `${API_BASE_URL}/auth/login`;
const signupUrl = `${API_BASE_URL}/auth/signup`;

const verificationData: EmailSchema = {
  email: "John@gmail.com"
};

const loginData: LoginSchema = {
  email: verificationData.email,
  password: "John123",
};
    
const signupData: SignupSchema = {
    name: "John",
    ...loginData,
}

const user1 = {
    ...signupData,
    verified: false,
    name: "John",
    role: "USER",
    countryCode: "DE",
    currency: "EUR",
    accessToken:"accessToken"
}

const user2 = {
    ...signupData,
    email:"Boe@gmail.com",
  verified: true,
  name: "john",
  role: "USER",
  countryCode: "DE",
  currency: "EUR",
  accessToken: "accessToken",
};

const users: {
    name: string,
    email: string,
    accessToken: string,
    verified:boolean
}[] = [user1, user2];

const handleLogin: ResponseResolver<
  HttpRequestResolverExtras<PathParams>,
  LoginSchema
> = async ({ request }) => {
  const captchaToken = request.headers.get("x-cf-turnstile-token");
  const body = await request.json();
  const email = body?.email;

  if (!captchaToken) {
    return HttpResponse.json({ message: "Captcha required" }, { status: 400 });
  }

  const existingUser = users.find((u) => u.email === email);

  if (existingUser && !existingUser.verified) {
    return HttpResponse.json(
      { message: "account not verified yet" },
      { status: 400 }
    );
  }

  const response: AuthResponse = {
    accessToken: "accessToken",
    user: {
      name: "John",
      role: "USER",
      countryCode: "DE",
      currency: "EUR",
    },
  };
  return HttpResponse.json(response);
};

const handleSignup: ResponseResolver<
  HttpRequestResolverExtras<PathParams>,
  SignupSchema
> = async ({ request }) => {
  const body = await request.json();
  const captchaToken = request.headers.get("x-cf-turnstile-token");

  if (!captchaToken) {
    return HttpResponse.json({ message: "Captcha required" }, { status: 400 });
  }

  const userExists = users.some((u) => u.email === body.email);
  if (userExists) {
    return HttpResponse.json(
      { message: "User with that email already exists" },
      { status: 403 }
    );
  }

  return HttpResponse.json({
    message: "Signup successful, verify your Email.",
  });
};

export const handlers = [
  http.post(loginUrl, handleLogin),
    http.post(signupUrl, handleSignup),
];
