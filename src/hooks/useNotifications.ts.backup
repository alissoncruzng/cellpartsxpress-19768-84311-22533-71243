import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';
import { toast } from 'sonner';

export const useNotifications = (userRole?: string) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    try {
      if (!('Notification' in window)) {
        toast.error('Este navegador não suporta notificações');
        return null;
      }

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setNotificationPermission('granted');

        // Save permission to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await saveNotificationPermission(user.id, true, userRole);
        }

        toast.success('Notificações ativadas!');
        return 'granted';
      } else {
        toast.error('Permissão de notificação negada');
        return null;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Erro ao ativar notificações');
      return null;
    }
  };

  const saveNotificationPermission = async (userId: string, granted: boolean, role?: string) => {
    try {
      await supabase.from('user_notifications').upsert({
        user_id: userId,
        permission_granted: granted,
        device_type: getDeviceType(),
        user_role: role || 'client',
      });
    } catch (error) {
      console.error('Error saving notification permission:', error);
    }
  };

  const getDeviceType = (): string => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    return 'web';
  };

  // Simple notification function using browser notifications
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (notificationPermission === 'granted') {
      new Notification(title, options);

      // Show toast notification
      toast(title, {
        description: options?.body,
        duration: 5000,
      });
    }
  };

  return {
    notificationPermission,
    fcmToken,
    requestPermission,
    showNotification,
  };
};
