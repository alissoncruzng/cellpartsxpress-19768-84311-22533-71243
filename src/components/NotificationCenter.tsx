// @ts-nocheck - Types will be regenerated after migration
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { Bell, Check, Package, Truck, DollarSign, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  order_id?: string;
  data?: any;
  is_read: boolean;
  sent_at: string;
}

interface NotificationCenterProps {
  userRole?: string;
}

export default function NotificationCenter({ userRole }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { notificationPermission, requestPermission } = useNotifications(userRole);

  useEffect(() => {
    // Verifica se há um usuário logado antes de carregar notificações
    const checkUserAndLoad = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await loadNotifications();
          await subscribeToNotifications();
        }
      } catch (error) {
        console.warn("Erro ao verificar usuário para notificações:", error);
      }
    };
    
    checkUserAndLoad();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("Usuário não autenticado, pulando carregamento de notificações");
        return;
      }

      // Verifica se a tabela de notificações existe
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(20);

      if (error) {
        console.warn("Tabela de notificações não encontrada ou erro ao carregar:", error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error: any) {
      console.warn("Erro ao carregar notificações:", error);
    }
  };

  const subscribeToNotifications = () => {
    const { data: { user } } = supabase.auth.getUser();
    
    user.then((result) => {
      if (!result.user) return;

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${result.user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            
            // Show toast
            toast(newNotification.title, {
              description: newNotification.body,
              duration: 5000,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success("Todas as notificações marcadas como lidas");
    } catch (error: any) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.data?.url) {
      navigate(notification.data.url);
      setOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      new_order: Package,
      order_update: Truck,
      delivery_assigned: Truck,
      delivery_completed: Check,
      payment: DollarSign,
      promotion: Megaphone,
      system: Bell,
    };
    return icons[type] || Bell;
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {notificationPermission !== 'granted' && (
            <div className="p-4 bg-muted/50 border-b">
              <p className="text-sm text-muted-foreground mb-2">
                Ative as notificações para receber alertas em tempo real
              </p>
              <Button
                size="sm"
                onClick={requestPermission}
                className="w-full"
              >
                Ativar Notificações
              </Button>
            </div>
          )}

          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        !notification.is_read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 ${!notification.is_read ? "text-primary" : "text-muted-foreground"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`font-semibold text-sm ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.body}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(notification.sent_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
