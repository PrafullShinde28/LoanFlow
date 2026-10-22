import axiosClient from "./axiosClient";

export const dashboardApi = {
  getCustomerDashboard: () => axiosClient.get("/dashboard/customer"),
  getOfficerDashboard: () => axiosClient.get("/dashboard/officer"),
  getManagerDashboard: () => axiosClient.get("/dashboard/manager"),
  getAdminDashboard: () => axiosClient.get("/dashboard/admin"),
};
