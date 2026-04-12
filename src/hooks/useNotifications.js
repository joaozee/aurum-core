import { useState, useEffect, useCallback } from "react";
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

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermissionState(result);
    return result;
  };

  const sendBrowserNotification = (title, body, link) => {
    if (Notification.permission !== "granted") return;
    const n = new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
    if (link) n.onclick = () => { window.focus(); window.location.href = link; };
  };

  const createNotification = useCallback(async (userEmail, { type, title, body, link, icon }) => {
    await base44.entities.Notification.create({
      user_email: userEmail,
      type, title, body, link, icon,
      read: false,
    });
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
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.type === "create" && event.data?.user_email === user.email) {
        setNotifications(prev => [event.data, ...prev].slice(0, 20));
        sendBrowserNotification(event.data.title, event.data.body, event.data.link);
      }
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