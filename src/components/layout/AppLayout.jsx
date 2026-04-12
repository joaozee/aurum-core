import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { base44 } from "@/api/base44Client";
import { useNotifications } from "@/hooks/useNotifications";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { usePWA } from "@/hooks/usePWA";
import InstallBanner from "../notifications/InstallBanner";
import PermissionBanner from "../notifications/PermissionBanner";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { showBanner: showInstall, install, dismiss: dismissInstall } = usePWA();
  const notif = useNotifications(user);
  useRealTimeNotifications(user, notif.createNotification);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0a" }}>
      {/* Mobile sidebar overlay - at root level to avoid stacking context issues */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {showInstall && <InstallBanner onInstall={install} onDismiss={dismissInstall} />}
      {notif.permissionState === "default" && <PermissionBanner onRequest={notif.requestPermission} />}
      <div className="flex flex-1 relative">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          user={user}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className={`transition-all duration-300 flex-1 flex flex-col ${collapsed ? "md:ml-[68px]" : "md:ml-[260px]"}`}>
          <Header
            notifications={notif.notifications}
            unreadCount={notif.unreadCount}
            onMarkAllRead={notif.markAllRead}
            onMarkRead={notif.markRead}
            mobileOpen={mobileOpen}
            onMenuToggle={() => setMobileOpen(o => !o)}
          />
          <main className="p-4 md:p-6 pb-24 md:pb-6 min-h-[calc(100vh-3.5rem)] overflow-auto">
            <Outlet context={{ user }} />
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}