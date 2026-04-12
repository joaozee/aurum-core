import { useState, useEffect, useCallback } from "react";
import { showNotification } from "@/utils/notifications";
import { base44 } from "@/api/base44Client";

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [permissionState, setPermissionState] = useState(Notification.permission);

  const loadNotifications = useCallback(async () => {
    if (!user?.email) return;
    const items = await base44.entities.Notification.filter(
      { user_email: user.email },
      "-created_date",
      20
    );
    setNotifications(items);
  }, [user?.email]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // SW registration handled in main.jsx

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermissionState(result);
    return result;
  };

  const sendBrowserNotification = async (title, body, link) => {
    await showNotification(title, body, link || '/');
  };

  const createNotification = useCallback(async (_userEmail, { title, body, link }) => {
    // DB records are created by the backend automation — only show browser notification here
    await showNotification(title, body || title, link || '/');
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Real-time: subscribe to new notifications for this user
  useEffect(() => {
    if (!user?.email) return;
    const subscribeTime = new Date();
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.type !== "create") return;
      const record = event.data;
      if (!record || record.user_email !== user.email) return;
      // Only trigger for records created AFTER the subscription was initialized
      if (record.created_date && new Date(record.created_date) <= subscribeTime) return;
      setNotifications(prev => [record, ...prev].slice(0, 20));
      sendBrowserNotification(record.title, record.body, record.link);
    });
    return unsub;
  }, [user?.email]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    permissionState,
    requestPermission,
    createNotification,
    markAllRead,
    markRead,
    sendBrowserNotification,
  };
}