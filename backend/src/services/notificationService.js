import Notification from "../models/Notification.js";

export const createNotification = async ({
  recipientId,
  applicationId = null,
  title,
  message,
  type = "INFO",
}) => {
  try {
    return await Notification.create({
      recipientId,
      applicationId,
      title,
      message,
      type,
    });
  } catch (error) {
    console.error("Failed to create notification:", error.message);
    return null;
  }
};
