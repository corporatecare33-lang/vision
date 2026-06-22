import { useEffect, useState } from "react";
import { products as fallbackProducts } from "../data/data";
import { getApiProducts } from "../services/productsApi";

export const useCatalogProducts = () => {
  const [apiProducts, setApiProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getApiProducts()
      .then((items) => {
        if (isMounted) {
          setApiProducts(items);
          setError("");
        }
      })
      .catch((apiError) => {
        if (isMounted) {
          setError(apiError.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    products: apiProducts.length > 0 ? apiProducts : fallbackProducts,
    apiProducts,
    isLoading,
    error,
    isUsingFallback: apiProducts.length === 0,
  };
};
