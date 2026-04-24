'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  requestNotificationPermission,
  registerFCMToken,
  removeFCMToken,
  listenToForegroundMessages,
} from '@/lib/fcm';

interface UseNotificationsOptions {
  userId: string;
  userType: 'admin' | 'temple_admin' | 'seller' | 'devotee';
  enabled?: boolean;
}

/**
 * Hook to initialize Firebase notifications for panels
 * Use this in Admin/Temple/Seller layout after login
 *
 * Usage:
 *   const { token } = useNotifications({ userId: adminId, userType: 'admin' });
 */
export const useNotifications = ({
  userId,
  userType,
  enabled = true,
}: UseNotificationsOptions) => {
  const tokenRef = useRef<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !userId || typeof window === 'undefined') return;

    const init = async () => {
      // Step 1: Permission maango aur token lo
      const token = await requestNotificationPermission();
      if (!token) return;

      tokenRef.current = token;

      // Step 2: Token backend me register karo
      console.log(`📋 Registering token for ${userType} with ID: ${userId}`);
      await registerFCMToken(token, userId, userType);

      // Step 3: Foreground messages sunna shuru karo
      const unsubscribe = await listenToForegroundMessages(({ title, body, data }) => {
        console.log("🔥 Foreground message received, showing toast:", { title, body });
        
        const parseLocalizedString = (str: string) => {
          try {
            const parsed = JSON.parse(str);
            if (typeof parsed === 'object' && parsed !== null) {
              const lang = typeof window !== 'undefined' ? localStorage.getItem('lang') || 'en' : 'en';
              return parsed[lang] || parsed.en || str;
            }
          } catch(e) {}
          return str;
        };

        const displayTitle = parseLocalizedString(title);
        const displayBody = parseLocalizedString(body);
        
        // Notification Sound Play Karo
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(e => console.warn("Audio play failed:", e));
        } catch (err) {
          console.error("Audio error:", err);
        }

        // Sonner toast show karo jab notification aaye
        toast(displayTitle, {
          description: displayBody,
          duration: Infinity, 
          style: {
            backgroundColor: '#16a34a',
            color: '#ffffff',
            border: 'none',
          },
          cancel: {
            label: 'Close',
            onClick: () => console.log('Toast closed text'),
          },
          action: data?.link
            ? {
                label: 'View Order',
                onClick: () => window.open(data.link, '_self'),
              }
            : undefined,
        });

        // 💡 Signal bhejo taaki Bell Icon update ho sake
        window.dispatchEvent(new CustomEvent('notification-received', { 
            detail: { title, body, data } 
        }));
      });

      if (unsubscribe) {
        unsubscribeRef.current = unsubscribe;
      }
    };

    init();

    // Cleanup: component unmount pe listener hata do
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId, userType, enabled]);

  // Logout ke waqt call karo ye function
  const handleLogout = async () => {
    if (tokenRef.current) {
      await removeFCMToken(tokenRef.current);
      tokenRef.current = null;
    }
  };

  return {
    token: tokenRef.current,
    handleLogout,
  };
};
