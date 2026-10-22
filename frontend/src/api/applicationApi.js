import axiosClient from "./axiosClient";

export const applicationApi = {
  getApplications: (params) => axiosClient.get("/applications", { params }),
  getApplicationById: (id) => axiosClient.get(`/applications/${id}`),
  createApplication: (data) => axiosClient.post("/applications", data),
  updateApplication: (id, data) => axiosClient.put(`/applications/${id}`, data),

  // Eligibility
  runEligibility: (id, data = {}) => axiosClient.post(`/applications/${id}/eligibility`, data),
  getEligibility: (id) => axiosClient.get(`/applications/${id}/eligibility`),

  // Underwriter Review
  recommendApproval: (id, data) => axiosClient.post(`/applications/${id}/recommend`, data),
  recommendRejection: (id, data) => axiosClient.post(`/applications/${id}/reject-officer`, data),
  requestDocuments: (id, data) => axiosClient.post(`/applications/${id}/request-documents`, data),
  getReviews: (id) => axiosClient.get(`/applications/${id}/reviews`),

  // Manager Approval & Sanction
  approveApplication: (id, data) => axiosClient.post(`/applications/${id}/approve`, data),
  rejectApplication: (id, data) => axiosClient.post(`/applications/${id}/reject`, data),
  getSanction: (id) => axiosClient.get(`/applications/${id}/sanction`),

  // Disbursement
  disburseLoan: (id, data) => axiosClient.post(`/applications/${id}/disburse`, data),
  getDisbursement: (id) => axiosClient.get(`/applications/${id}/disbursement`),

  // Audit history
  getHistory: (id) => axiosClient.get(`/applications/${id}/history`),
};
