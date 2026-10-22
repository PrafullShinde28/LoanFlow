import axiosClient from "./axiosClient";

export const documentApi = {
  getDocuments: (applicationId) =>
    axiosClient.get(`/applications/${applicationId}/documents`),

  uploadDocument: (applicationId, formData) =>
    axiosClient.post(`/applications/${applicationId}/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  verifyDocument: (documentId, remarks) =>
    axiosClient.put(`/documents/${documentId}/verify`, { remarks }),

  rejectDocument: (documentId, reason) =>
    axiosClient.put(`/documents/${documentId}/reject`, { reason }),

  getDocumentUrl: (documentId) => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return `${base}/documents/${documentId}/file`;
  },
};
