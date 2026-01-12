"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function AddProductButton() {
  return (
    <Link href="/user/admin/products/create">
      <Button className="border">Add Product</Button>
    </Link>
  );
}

export default AddProductButton;
