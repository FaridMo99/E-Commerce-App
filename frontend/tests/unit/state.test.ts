import { it, describe, expect, beforeEach, vi, afterEach } from "vitest";
import useAuth, { ZustandUser } from "../../stores/authStore";
import useDebounce from "../../hooks/useDebounce";
import { renderHook, act } from "@testing-library/react";

describe("Global State Tests", () => {
  beforeEach(() => {
    useAuth.getState().clearState();
  });

  const mockUser: ZustandUser = {
    name: "john",
    role: "USER",
    countryCode: "DE",
    currency: "EUR",
  };

  it("should initialize with null user and token", () => {
    const { user, accessToken } = useAuth.getState();
    expect(user).toBeNull();
    expect(accessToken).toBeNull();
  });

  it("should set the user correctly", () => {
    useAuth.getState().setUser(mockUser);

    expect(useAuth.getState().user).toEqual(mockUser);
  });

  it("should set the full state", () => {
    const mockToken = "secret-token";

    useAuth.getState().setState(mockToken, mockUser);

    expect(useAuth.getState().accessToken).toBe(mockToken);
    expect(useAuth.getState().user).toBe(mockUser);
  });

  it("should clear the state", () => {
    useAuth.getState().setState("token", mockUser);
    useAuth.getState().clearState();

    expect(useAuth.getState().user).toBeNull();
    expect(useAuth.getState().accessToken).toBeNull();
  });
});

describe("Custom Hooks Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 500));
    expect(result.current).toBe("hello");
  });

  it("should not update the value before the delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 500 } },
    );

    rerender({ value: "world", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("hello");
  });

  it("should update the value after the delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 500 } },
    );

    rerender({ value: "world", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("world");
  });
});
