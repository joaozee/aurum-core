import { useRef, useEffect, useState } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

export default function NotificationCenter({ notifications, unreadCount, onMarkAllRead, onMarkRead }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (notif) => {
    onMarkRead(notif.id);
    if (notif.link) navigate(notif.link);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-gold rounded-full flex items-center justify-center text-[9px] font-bold text-black px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Notificações</span>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-gold hover:text-gold-hover transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-secondary/60 ${
                    !notif.read ? "bg-gold/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">{notif.icon || "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${notif.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                        {notif.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {moment(notif.created_date).fromNow()}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}