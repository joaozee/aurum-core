import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { base44 } from "@/api/base44Client";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} user={user} />
      <div className={`transition-all duration-300 ${collapsed ? "ml-[68px]" : "ml-[260px]"}`}>
        <Header />
        <main className="p-6 min-h-[calc(100vh-3.5rem)] overflow-auto">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}