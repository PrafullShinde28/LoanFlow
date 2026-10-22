import axiosClient from "./axiosClient";

export const productApi = {
  getProducts: (activeOnly = false) =>
    axiosClient.get(`/loan-products${activeOnly ? "?activeOnly=true" : ""}`),
  getProductById: (id) => axiosClient.get(`/loan-products/${id}`),
  createProduct: (data) => axiosClient.post("/loan-products", data),
  updateProduct: (id, data) => axiosClient.put(`/loan-products/${id}`, data),
  deleteProduct: (id) => axiosClient.delete(`/loan-products/${id}`),
};
