import ApplicationStatusHistory from "../models/ApplicationStatusHistory.js";
import { createNotification } from "./notificationService.js";

export const logStatusChange = async ({
  applicationId,
  previousStatus,
  newStatus,
  action,
  performedBy,
  role,
  remarks,
  notifyUser = null,
  notifyMessage = null,
  notifyTitle = null,
}) => {
  const history = await ApplicationStatusHistory.create({
    applicationId,
    previousStatus,
    newStatus,
    action,
    performedBy,
    role,
    remarks,
    timestamp: new Date(),
  });

  if (notifyUser && notifyMessage) {
    await createNotification({
      recipientId: notifyUser,
      applicationId,
      title: notifyTitle || `Application Status: ${newStatus}`,
      message: notifyMessage,
      type: newStatus === "REJECTED" ? "ERROR" : newStatus === "DISBURSED" ? "SUCCESS" : "INFO",
    });
  }

  return history;
};
