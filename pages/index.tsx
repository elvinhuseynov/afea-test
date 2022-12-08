import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import styles from "../styles/Home.module.css";
import { getProducts } from "./api/products";

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
};

type State = {
  orderBy: "title" | "price" | "rating";
  filter: {
    price: [number, number];
    rating: [number, number];
    brand: string;
  };
  products: Product[];
  productsShow: Product[];
  values: {
    priceFrom: number;
    priceTo: number;
    ratingFrom: number;
    ratingTo: number;
    brand: string;
  };
};

export default function Home() {
  const { data, isSuccess, isLoading } = useQuery("getProducts", () =>
    getProducts()
  );
  const [state, setState] = useState<State>({
    products: [],
    productsShow: [],
    orderBy: "title",
    filter: {
      price: [0, 100000],
      rating: [0, 5],
      brand: "",
    },
    values: {
      priceFrom: 0,
      priceTo: 100000,
      brand: "",
      ratingFrom: 0,
      ratingTo: 5,
    },
  });

  const applyFilters = useCallback(
    (products?: Product[]) => {
      return products?.filter(
        (product) =>
          !(
            product.rating < state.values.ratingFrom ||
            product.rating > state.values.ratingTo ||
            product.price < state.values.priceFrom ||
            product.price > state.values.priceTo ||
            (!product.brand.toLowerCase().includes(state.values.brand) &&
              state.values.brand !== "")
          )
      );
    },
    [
      state.values.brand,
      state.values.priceFrom,
      state.values.priceTo,
      state.values.ratingFrom,
      state.values.ratingTo,
    ]
  );

  const orderProducts = useCallback(
    (products: Product[]) => {
      if (state.orderBy === "title")
        return products?.sort((a: Product, b: Product) =>
          a.title?.localeCompare(b.title)
        );

      if (state.orderBy === "price")
        return products?.sort((a, b) => a.price - b.price);

      if (state.orderBy === "rating")
        return products?.sort((a, b) => a.rating - b.rating);

      return products;
    },
    [state.orderBy]
  );

  const handleProductChanges = useCallback(() => {
    const products = data?.products;
    console.log({ sta: applyFilters(products) });

    const filteredProducts = applyFilters(products);
    const orderedProducts = orderProducts(filteredProducts || []);
    setState((prevState) => ({
      ...prevState,
      products,
      productsShow: orderedProducts,
    }));
  }, [applyFilters, data?.products, orderProducts]);

  const showProducts = useMemo(() => {
    return (state.productsShow ?? []).map((product: Product) => (
      <div key={product.id}>
        <h4>ID: {product.id}</h4>
        <h4>title: {product.title}</h4>
        <h4>description: {product.description}</h4>
        <h4>price: {product.price}</h4>
        <h4>rating: {product.rating}</h4>
        <h4>brand: {product.brand}</h4>
        <hr />
      </div>
    ));
  }, [state.productsShow]);

  const orderByTitle = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      orderBy: "title",
    }));
  }, []);

  const orderByPrice = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      orderBy: "price",
    }));
  }, []);

  const orderByRating = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      orderBy: "rating",
    }));
  }, []);

  const handleInputChange = useCallback(
    (name: keyof Omit<State["values"], "brand">, value: number) => {
      console.log({ value });
      setState((prevState) => ({
        ...prevState,
        values: {
          ...prevState.values,
          [`${name}`]: value,
        },
      }));
    },
    []
  );

  const handleBrandNameChange = useCallback((brand: string) => {
    setState((prevState) => ({
      ...prevState,
      values: {
        ...prevState.values,
        brand: brand.toLowerCase(),
      },
    }));
  }, []);

  useEffect(() => {
    if (isSuccess) {
      handleProductChanges();
    }
  }, [handleProductChanges, isSuccess, isLoading]);

  return (
    <div className={styles.container}>
      <>
        ORDERED BY: {state.orderBy}
        <button onClick={orderByTitle}>order by title</button>
        <button onClick={orderByPrice}>order by price</button>
        <button onClick={orderByRating}>order by rating</button>
        <label>priceFrom</label>
        <input
          name="priceFrom"
          type="number"
          value={state.values.priceFrom}
          onChange={({ target: { value } }) =>
            handleInputChange("priceFrom", Number(value))
          }
        />
        <label>priceTo</label>
        <input
          name="priceTo"
          value={state.values.priceTo}
          type="number"
          onChange={({ target: { value } }) =>
            handleInputChange("priceTo", Number(value))
          }
        />
        <label>ratingFrom</label>
        <input
          name="ratingFrom"
          type="number"
          value={state.values.ratingFrom}
          onChange={({ target: { value } }) =>
            handleInputChange("ratingFrom", Number(value))
          }
        />
        <label>ratingTo</label>
        <input
          name="ratingTo"
          type="number"
          value={state.values.ratingTo}
          onChange={({ target: { value } }) =>
            handleInputChange("ratingTo", Number(value))
          }
        />
        <label>brand</label>
        <input
          name="brand"
          value={state.values.brand}
          onChange={({ target: { value } }) => handleBrandNameChange(value)}
        />
        {showProducts}
      </>
    </div>
  );
}
