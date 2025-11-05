import { create } from "zustand"

//change later to proper, this just placeholder
type Product = {
    name: string,
    amountAvailable: number,
    price: number,
    description: string,
    img: string,
}

type ProductsStore = {
    products: Product[],
    setProducts: (product: Product) => void,
    getProducts:()=>Product[]
}

const useProducts = create<ProductsStore>((set, get) => ({
  products: [],
  setProducts: (product) => {
    set((pre) => ({ products: [...pre.products, product] }));
  },
  getProducts: () => {
    return get().products;
  },
}));

export default useProducts