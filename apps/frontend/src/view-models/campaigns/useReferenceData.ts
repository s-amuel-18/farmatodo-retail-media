"use client";

import { useQuery } from "@tanstack/react-query";
import { referenceDataService } from "../../services/reference-data.service";

export function useReferenceData() {
  const brands = useQuery({ queryKey: ["reference", "brands"], queryFn: referenceDataService.listBrands });
  const products = useQuery({
    queryKey: ["reference", "products"],
    queryFn: referenceDataService.listProducts,
  });
  const suppliers = useQuery({
    queryKey: ["reference", "suppliers"],
    queryFn: referenceDataService.listSuppliers,
  });
  const mediaCosts = useQuery({
    queryKey: ["reference", "mediaCosts"],
    queryFn: referenceDataService.listMediaCosts,
  });

  return {
    brands: brands.data ?? [],
    products: products.data ?? [],
    suppliers: suppliers.data ?? [],
    mediaCosts: mediaCosts.data ?? [],
    isLoading: brands.isLoading || products.isLoading || suppliers.isLoading || mediaCosts.isLoading,
  };
}
