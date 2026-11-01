import { addDoc, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { Collections } from "@/lib/firestore";
import type { AssistanceRequest, HelpPointCategory } from "@/types";

export interface SubmitAssistanceParams {
  eventId: string;
  helpPointId?: string;
  message: string;
  category: HelpPointCategory;
}

/** Submit a pilgrim assistance request */
export async function submitAssistanceRequest(
  params: SubmitAssistanceParams,
): Promise<void> {
  await addDoc(Collections.assistanceRequests(), {
    eventId: params.eventId,
    helpPointId: params.helpPointId ?? null,
    message: params.message,
    category: params.category,
    status: "pending",
    createdAt: serverTimestamp(),
    resolvedAt: null,
  });
}

/** Fetch assistance requests for an event (admin use) */
export async function fetchAssistanceRequests(
  eventId: string,
): Promise<AssistanceRequest[]> {
  const q = query(
    Collections.assistanceRequests(),
    where("eventId", "==", eventId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      eventId: String(data.eventId ?? ""),
      helpPointId: data.helpPointId ? String(data.helpPointId) : undefined,
      message: String(data.message ?? ""),
      category: data.category as HelpPointCategory,
      status: (data.status as AssistanceRequest["status"]) ?? "pending",
      createdAt: String(data.createdAt ?? ""),
      resolvedAt: data.resolvedAt ? String(data.resolvedAt) : undefined,
    } satisfies AssistanceRequest;
  });
}
