import Notification from "../models/Notification.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .populate("applicationId", "applicationNumber status")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    return sendSuccess(res, "Notifications retrieved", {
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, "Notification not found", [], 404);
    }

    return sendSuccess(res, "Notification marked as read", { notification });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    );

    return sendSuccess(res, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};
