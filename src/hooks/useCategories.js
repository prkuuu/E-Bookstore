import { useEffect, useState } from "react";
import { getCategories } from "../services/categoriesService";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCategories();
        setCategories([{ id: 0, name: "All" }, ...(data ?? [])]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

export default useCategories;
