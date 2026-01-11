vi.mock("sonner", async (importOriginal) => {
  const actual = await importOriginal<typeof import("sonner")>();
  return {
    ...actual,
    toast: {
      ...actual.toast,
      error: vi.fn((msg) => actual.toast.error(msg)),
      success: vi.fn((msg) => actual.toast.success(msg)),
    },
  };
});
import { EmailSchema, LoginSchema, SignupSchema } from "@monorepo/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import useAuth from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { createElement, forwardRef, useImperativeHandle } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { LoginForm } from "@/components/forms/login-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { SignupForm } from "@/components/forms/signup-form";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const verificationData: EmailSchema = {
  email: "John@gmail.com",
};

const loginData: LoginSchema = {
  email: verificationData.email,
  password: "John123",
};

const signupData: SignupSchema = {
  name: "John",
  password: loginData.password,
  email:"Jorge@gmail.com"
};

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

vi.mock("@marsidev/react-turnstile", () => ({
  // eslint-disable-next-line react/display-name
  Turnstile: forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
      execute: vi.fn(),
      getResponsePromise: vi.fn().mockResolvedValue("mock-captcha-token"),
      reset: vi.fn(),
    }));
    return createElement("div", { "data-testid": "turnstile-mock" });
  }),
}));

describe("Login Integration Tests", () => {

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    useAuth.getState().clearState();
    queryClient.clear();
  });

  const renderLogin = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <LoginForm />
      </QueryClientProvider>
    );

  it("should update auth store and redirect on successful login", async () => {
    const user = userEvent.setup();

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), "Boe@gmail.com");
    await user.type(screen.getByLabelText(/password/i), "John123");
    await user.click(screen.getByTestId("submitButton"));

    await waitFor(() => {
      expect(useAuth.getState().user?.name).toBe("John");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("should show specific error when account is not verified", async () => {
    const user = userEvent.setup();

    renderLogin();

    await user.type(screen.getByLabelText(/email/i), "John@gmail.com");
    await user.type(screen.getByLabelText(/password/i), "John123");
    await user.click(screen.getByTestId("submitButton"));

    expect(
      await screen.findByText(/account not verified yet/i)
    ).toBeInTheDocument();
  });
});

describe("Signup Tests", () => {

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    useAuth.getState().clearState();
    queryClient.clear();
  });

  const renderSignup = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <SignupForm />
      </QueryClientProvider>
    );

  it("should successfully sign up a new user and redirect", async () => {
    const user = userEvent.setup();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);

    renderSignup();

    await user.type(screen.getByLabelText(/^name/i), signupData.name);
    await user.type(screen.getByLabelText(/^email/i), signupData.email);
    await user.type(screen.getByLabelText(/^password/i), signupData.password);
    await user.type(screen.getByLabelText(/confirm password/i), signupData.password);

    await user.click(screen.getByTestId("submitButton"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Signup successful. Check your E-Mails and follow the link");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("should show error toast if email is already taken (API Error)", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByLabelText(/^name/i), signupData.name);
    await user.type(screen.getByLabelText(/^email/i), "John@gmail.com");
    await user.type(screen.getByLabelText(/^password/i), signupData.password);
    await user.type(screen.getByLabelText(/confirm password/i), signupData.password);

    await user.click(screen.getByTestId("submitButton"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "User with that email already exists"
      );
    });
  });
});
