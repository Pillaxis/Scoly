import { ScolyNotification } from "@/types/notifications";

const DISMISS_KEY = "scoly_browser_notif_prompt_dismissed";

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getBrowserNotificationPermission(): "granted" | "denied" | "default" | "unsupported" {
  if (!isBrowserNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<"granted" | "denied" | "default"> {
  if (!isBrowserNotificationSupported()) return "default";

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.debug("[Browser Notification] Request permission error:", err);
    return "default";
  }
}

export function shouldShowPermissionBanner(): boolean {
  if (!isBrowserNotificationSupported()) return false;
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return false;
  }
  if (typeof window !== "undefined") {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return false; // Ne pas redemander avant 7 jours
    }
  }
  return true;
}

export function dismissPermissionBanner(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }
}

export function triggerBrowserNotification(notif: ScolyNotification): void {
  if (!isBrowserNotificationSupported()) return;
  if (Notification.permission !== "granted") return;

  // Ne pas spammer si la page est actuellement active et visible
  const isDocumentVisible = typeof document !== "undefined" && document.visibilityState === "visible";
  if (isDocumentVisible && notif.priority !== "critical") {
    return;
  }

  try {
    const iconUrl = "/icon.svg";
    const nativeNotif = new Notification(notif.title, {
      body: notif.message,
      icon: iconUrl,
      badge: iconUrl,
      tag: notif.id,
      requireInteraction: notif.priority === "critical",
    });

    nativeNotif.onclick = () => {
      window.focus();
      if (notif.action_url) {
        window.location.href = notif.action_url;
      }
      nativeNotif.close();
    };
  } catch (err) {
    console.debug("[Browser Notification] Trigger error:", err);
  }
}
