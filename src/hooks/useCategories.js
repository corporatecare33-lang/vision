import { useEffect, useState } from "react";
import { categories as fallbackCategories } from "../data/data";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useCategories = () => {
  const [apiCategories, setApiCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setApiCategories(data);
          }
          setError("");
        }
      } catch (apiError) {
        if (isMounted) {
          setError(apiError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => { isMounted = false; };
  }, []);

  return {
    categories: apiCategories.length > 0 ? apiCategories : fallbackCategories,
    apiCategories,
    isLoading,
    error,
    isUsingFallback: apiCategories.length === 0,
  };
};

export const useCategory = (categoryId) => {
  const { categories } = useCategories();
  return categories.find((category) => category.id === categoryId) || null;
};

export const useSubcategory = (categoryId, subcategoryId) => {
  const category = useCategory(categoryId);
  return category?.subcategories?.find((subcategory) => subcategory.id === subcategoryId) || null;
};