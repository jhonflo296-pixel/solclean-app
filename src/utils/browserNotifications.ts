import { soundAlerts } from './soundAlerts';

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  return false;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function sendNativeNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    soundType?: 'new_order' | 'success' | 'alert';
  }
) {
  // Reproducir sonido sintetizado Web Audio
  if (options?.soundType === 'alert') {
    soundAlerts.playNewOrderTone();
  } else if (options?.soundType === 'success') {
    soundAlerts.playSuccessTone();
  } else {
    soundAlerts.playNewOrderTone();
  }

  // Vibrar en dispositivos móviles si está soportado
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([150, 75, 150]);
    } catch {
      // Ignorar restricciones de vibración
    }
  }

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notif = new Notification(title, {
      body: options?.body || 'Sol Clean Perú Logística',
      icon: options?.icon || 'https://www.solcleanperu.com/wp-content/uploads/2024/10/cropped-logo-192x192.png',
      tag: options?.tag || 'solclean_logistics',
      requireInteraction: options?.requireInteraction ?? false,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (err) {
    console.warn('Error al mostrar notificación nativa:', err);
  }
}
