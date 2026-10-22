import axiosClient from "./axiosClient";

export const enquiryApi = {
  createEnquiry: (data) => axiosClient.post("/enquiries", data),
  getEnquiries: (params) => axiosClient.get("/enquiries", { params }),
  getEnquiryById: (id) => axiosClient.get(`/enquiries/${id}`),
  updateEnquiry: (id, data) => axiosClient.put(`/enquiries/${id}`, data),
  convertEnquiry: (id) => axiosClient.post(`/enquiries/${id}/convert`),
};
