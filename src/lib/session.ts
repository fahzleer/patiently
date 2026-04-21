import {
  ref,
  set,
  update,
  onValue,
  off,
  onDisconnect,
  serverTimestamp,
  type DatabaseReference,
} from "firebase/database";
import { getDb } from "./firebase";
import type { PatientSession, PatientFormData } from "@/types/PatientSession";
import type { PatientSessionStatus } from "@/types/PatientSessionStatus";
import { EMPTY_FORM_DATA } from "@/types/PatientSession";

const SESSIONS_PATH = "sessions";
// Exported so regression tests can assert the key never silently changes.
// Changing this constant would wipe every active user's session.
export const SESSION_ID_KEY = "patiently_session_id";

// ─── Session Identity ────────────────────────────────────────────────────────

export function getOrCreateSessionId(): string {
  // Guard against SSR — sessionStorage is only available in browser
  if (typeof window === "undefined") return "";

  // sessionStorage is isolated per tab — each tab gets its own session
  // persists on refresh within the same tab, but not across tabs
  const existing = sessionStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  sessionStorage.setItem(SESSION_ID_KEY, id);
  return id;
}

export function clearSessionId(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_ID_KEY);
}

// ─── Patient Operations ──────────────────────────────────────────────────────

export async function createSession(sessionId: string): Promise<void> {
  const sessionRef = ref(getDb(), `${SESSIONS_PATH}/${sessionId}`);
  const now = new Date().toISOString();

  const session: PatientSession = {
    id: sessionId,
    status: "filling",
    createdAt: now,
    lastActivityAt: now,
    formData: { ...EMPTY_FORM_DATA },
  };

  await set(sessionRef, session);
}

export async function fetchSession(
  sessionId: string
): Promise<PatientSession | null> {
  return new Promise((resolve) => {
    const sessionRef = ref(getDb(), `${SESSIONS_PATH}/${sessionId}`);
    onValue(
      sessionRef,
      (snapshot) => {
        off(sessionRef);
        resolve(snapshot.exists() ? (snapshot.val() as PatientSession) : null);
      },
      { onlyOnce: true }
    );
  });
}

export async function updateFormData(
  sessionId: string,
  formData: PatientFormData
): Promise<void> {
  const sessionRef = ref(getDb(), `${SESSIONS_PATH}/${sessionId}`);
  await update(sessionRef, {
    formData,
    status: "filling",
    lastActivityAt: new Date().toISOString(),
  });
}

export async function updateStatus(
  sessionId: string,
  status: PatientSessionStatus
): Promise<void> {
  const sessionRef = ref(getDb(), `${SESSIONS_PATH}/${sessionId}`);
  await update(sessionRef, {
    status,
    lastActivityAt: new Date().toISOString(),
  });
}

// ─── Disconnect Handler ──────────────────────────────────────────────────────

/**
 * Register a Firebase onDisconnect hook so that if the patient's WebSocket
 * drops (browser close, network loss, crash), the Firebase server
 * automatically marks the session as inactive — no client event needed.
 */
export async function registerDisconnect(sessionId: string): Promise<void> {
  const sessionRef = ref(getDb(), `${SESSIONS_PATH}/${sessionId}`);
  await onDisconnect(sessionRef).update({
    status: "inactive",
    lastActivityAt: serverTimestamp(),
  });
}

/**
 * Clears the onDisconnect hook. Call this once a terminal status like
 * "submitted" is written — otherwise the next disconnect (page reload,
 * tab close) will silently overwrite the status back to "inactive".
 */
export async function cancelDisconnect(sessionId: string): Promise<void> {
  const sessionRef = ref(getDb(), `${SESSIONS_PATH}/${sessionId}`);
  await onDisconnect(sessionRef).cancel();
}

// ─── Staff Operations ────────────────────────────────────────────────────────

export function watchSessions(
  callback: (sessions: PatientSession[]) => void
): () => void {
  const sessionsRef: DatabaseReference = ref(getDb(), SESSIONS_PATH);

  const handler = onValue(sessionsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val() as Record<string, PatientSession>;
    const sessions = Object.values(data);
    callback(sessions);
  });

  // Return unsubscribe function
  return () => off(sessionsRef, "value", handler);
}
