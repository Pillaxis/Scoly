import { getSupabaseBrowser, isSupabaseConfigured } from "../supabase/client";
import { ScolyNotification } from "@/types/notifications";
import { triggerBrowserNotification } from "./browser-notifications";

export interface RealtimeNotificationEvent {
  type: "NEW_NOTIFICATION" | "NOTIFICATION_READ" | "MARK_ALL_READ" | "NOTIFICATION_DELETED";
  notification?: ScolyNotification;
  notificationId?: string;
  schoolId: string;
  senderUserId?: string;
}

type RealtimeCallback = (event: RealtimeNotificationEvent) => void;

let activeChannel: any = null;
let currentSubscribedSchoolId: string | null = null;
const listeners = new Set<RealtimeCallback>();

/**
 * Initialise l'écoute temps réel sur Supabase pour l'école donnée.
 */
export function subscribeToSchoolNotifications(
  schoolId: string,
  callback: RealtimeCallback
): () => void {
  if (!isSupabaseConfigured || !schoolId) {
    return () => {};
  }

  listeners.add(callback);

  const client = getSupabaseBrowser();
  if (!client) return () => {};

  if (!activeChannel || currentSubscribedSchoolId !== schoolId) {
    if (activeChannel) {
      client.removeChannel(activeChannel);
      activeChannel = null;
    }

    currentSubscribedSchoolId = schoolId;
    const channelName = `school_notifications_${schoolId}`;

    activeChannel = client.channel(channelName, {
      config: {
        broadcast: { self: false },
        presence: { key: schoolId },
      },
    });

    // 1. Écoute des événements BROADCAST temps réel (inter-appareils immédiat)
    activeChannel.on(
      "broadcast",
      { event: "NOTIFICATION_EVENT" },
      ({ payload }: { payload: RealtimeNotificationEvent }) => {
        if (payload && payload.schoolId === schoolId) {
          // Si nouvelle notification importante, déclencher notification navigateur locale
          if (payload.type === "NEW_NOTIFICATION" && payload.notification) {
            triggerBrowserNotification(payload.notification);
          }

          listeners.forEach((listener) => {
            try {
              listener(payload);
            } catch (err) {
              console.debug("[Realtime] Notification listener error:", err);
            }
          });
        }
      }
    );

    // 2. Écoute des mutations directes dans la table PostgreSQL 'notifications'
    try {
      activeChannel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `school_id=eq.${schoolId}`,
        },
        (payload: any) => {
          const eventType = payload.eventType; // 'INSERT', 'UPDATE', 'DELETE'
          const row = payload.new || payload.old;

          if (eventType === "INSERT" && payload.new) {
            const notif: ScolyNotification = {
              id: payload.new.id,
              school_id: payload.new.school_id,
              user_id: payload.new.user_id,
              target_roles: payload.new.target_roles || [],
              type: payload.new.type,
              priority: payload.new.priority || "info",
              title: payload.new.title,
              message: payload.new.message,
              action_url: payload.new.action_url,
              action_label: payload.new.action_label,
              entity_type: payload.new.entity_type,
              entity_id: payload.new.entity_id,
              metadata: payload.new.metadata || {},
              is_read: Boolean(payload.new.is_read),
              read_at: payload.new.read_at,
              read_by: payload.new.read_by || [],
              dedup_key: payload.new.dedup_key,
              created_at: payload.new.created_at || new Date().toISOString(),
            };

            triggerBrowserNotification(notif);

            listeners.forEach((listener) => {
              listener({
                type: "NEW_NOTIFICATION",
                notification: notif,
                schoolId,
              });
            });
          } else if (eventType === "UPDATE" && payload.new) {
            listeners.forEach((listener) => {
              listener({
                type: "NOTIFICATION_READ",
                notificationId: payload.new.id,
                schoolId,
              });
            });
          } else if (eventType === "DELETE" && payload.old) {
            listeners.forEach((listener) => {
              listener({
                type: "NOTIFICATION_DELETED",
                notificationId: payload.old.id,
                schoolId,
              });
            });
          }
        }
      );
    } catch (pgErr) {
      console.debug("[Realtime] Postgres change subscription notice:", pgErr);
    }

    activeChannel.subscribe((status: string) => {
      if (status === "SUBSCRIBED") {
        console.debug(`[SCOLY Realtime] Connecté au flux de l'école ${schoolId}`);
      }
    });
  }

  return () => {
    listeners.delete(callback);
  };
}

/**
 * Diffuse un événement de notification instantanément vers tous les appareils connectés de l'école
 */
export async function broadcastNotificationEvent(
  event: RealtimeNotificationEvent
): Promise<void> {
  if (!activeChannel || !event.schoolId) return;

  try {
    await activeChannel.send({
      type: "broadcast",
      event: "NOTIFICATION_EVENT",
      payload: event,
    });
  } catch (err) {
    console.debug("[Realtime] Broadcast event warning:", err);
  }
}
