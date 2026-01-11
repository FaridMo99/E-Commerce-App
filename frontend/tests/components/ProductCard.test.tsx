import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Product } from "@/types/types";
import ProductCard from "../../components/main/product/ProductCard";


const mockProduct: Product = {
  id: "wqd",
  name: "Mouse",
  description: "wireless mouse",
  price: 5099,
  sale_price: 4099,
  currency: "USD",
  stock_quantity: 10,
  imageUrls: ["/img1.jpg", "/img2.jpg"],
  averageRating: 4.5,
  published_at: new Date(),
  updated_at: new Date(),
  category: {
    id: "pn",
    name: "electronics",
  },
  _count: {
    reviews: 4,
  },
};
 
describe("ProductCard Component", () => {
    it("renders product with information", () => {
        render(<ProductCard product={mockProduct} />);

        expect(screen.getByText("Mouse")).toBeInTheDocument();
        expect(
            screen.getByText("wireless mouse")
        ).toBeInTheDocument();
    });

    it("links to the product page", () => {
        render(<ProductCard product={mockProduct} />);
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "/products/wqd");
    });

    it("renders sold out tag and styles when stock is 0", () => {
        render(<ProductCard product={{...mockProduct, stock_quantity: 0}} />);

        expect(screen.getByText(/sold out/i)).toBeInTheDocument();

        const card = screen.getByTitle("Mouse");
        expect(card).toHaveClass("bg-muted", "opacity-35");
    });
    
    it("renders sale tag when sale_price is present", () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.getByText(/sale/i)).toBeInTheDocument();
    });

    it("renders new tag if product was published within 7 days", () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.getByText(/new/i)).toBeInTheDocument();
    });

    it("renders placeholder icon when no image URLs are provided", () => {
      render(<ProductCard product={mockProduct} />);

      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("renders the primary image when URL is provided", () => {
      render(<ProductCard product={mockProduct} />);

      const img = screen.getByAltText("product image");
      expect(img).toHaveAttribute("src", "/img1.jpg");
    });

    it("renders secondary image for hover effect when two images exist", () => {
      render(<ProductCard product={mockProduct} />);

      const hoverImg = screen.getByAltText("product image hover");
      expect(hoverImg).toHaveAttribute("src", "/img2.jpg");
      expect(hoverImg).toHaveClass("opacity-0", "hover:opacity-100");
    });

});