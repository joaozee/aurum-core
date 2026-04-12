import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Listens to new Notification records for the current user in real time.
 * All notification creation logic is handled by the backend function handleEntityNotification.
 */
export function useRealTimeNotifications(user, createNotification) {
  useEffect(() => {
    if (!user?.email) return;

    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.type !== "create") return;
      const notif = event.data;
      if (!notif || notif.user_email !== user.email) return;
      // Trigger browser notification
      if (typeof createNotification === "function") {
        createNotification(user.email, {
          type: notif.type || "info",
          icon: notif.icon || "🔔",
          title: notif.title,
          body: notif.body || notif.title,
          link: notif.link || "/",
        });
      }
    });

    return () => unsub && unsub();
  }, [user?.email]);
}