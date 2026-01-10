import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Searchbar from "../../components/main/header/Searchbar";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// 1. Mock Next.js Router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// 2. Mock TanStack Query
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

describe("Searchbar Component", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

    it("updates the input value on change", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useQuery as any).mockReturnValue({ data: [] });
      render(<Searchbar />);

      const input = screen.getByPlaceholderText("Search...");
      fireEvent.change(input, { target: { value: "iphone" } });

      expect(input).toHaveValue("iphone");
    });

    it("shows the Searchlist only when focused and input value", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useQuery as any).mockReturnValue({
        data: [{ id: "1", name: "iPhone" }],
      });

      render(<Searchbar />);
      const input = screen.getByPlaceholderText("Search...");

      fireEvent.change(input, { target: { value: "iph" } });
      fireEvent.focus(input);

      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText("iPhone")).toBeInTheDocument();
    });

    it("navigates to the products page on submit", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useQuery as any).mockReturnValue({ data: [{ id: "1" }] });
      render(<Searchbar />);

      const input = screen.getByPlaceholderText("Search...");
      fireEvent.change(input, { target: { value: "laptop" } });

      const form =
        screen.getByRole("textbox", { hidden: true }) || input.closest("form");
      fireEvent.submit(form!);

      expect(mockPush).toHaveBeenCalledWith("/products?search=laptop");
    });

    it("disables the search button when no result", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (useQuery as any).mockReturnValue({ data: [] });
      render(<Searchbar />);

      const button = screen.getByRole("button", { name: /search users/i });
      expect(button).toBeDisabled();
    });
});
