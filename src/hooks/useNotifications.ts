import { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
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
      const token = await requestNotificationPermission();
      
      if (token) {
        setFcmToken(token);
        setNotificationPermission('granted');
        
        // Save token to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await saveFCMToken(user.id, token, userRole);
        }
        
        toast.success('Notificações ativadas!');
        return token;
      } else {
        toast.error('Não foi possível ativar notificações');
        return null;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Erro ao ativar notificações');
      return null;
    }
  };

  const saveFCMToken = async (userId: string, token: string, role?: string) => {
    try {
      // Check if token already exists
      const { data: existing } = await supabase
        .from('fcm_tokens')
        .select('id')
        .eq('user_id', userId)
        .eq('token', token)
        .single();

      if (!existing) {
        await supabase.from('fcm_tokens').insert({
          user_id: userId,
          token: token,
          device_type: getDeviceType(),
          user_role: role || 'client',
        });
      }
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  };

  const getDeviceType = (): string => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    return 'web';
  };

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onMessageListener().then((payload: any) => {
      if (payload) {
        const { notification } = payload;
        
        // Show toast notification
        toast(notification.title || 'Nova Notificação', {
          description: notification.body,
          duration: 5000,
        });

        // Play notification sound
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Could not play sound:', e));
      }
    });

    return () => {
      // Cleanup if needed
    };
  }, []);

  return {
    notificationPermission,
    fcmToken,
    requestPermission,
  };
};
