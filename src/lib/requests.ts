// Local-storage backed request store.
// Production note: replace with Lovable Cloud (Supabase), Firebase, or a backend API.
// Email notifications to skywavenexus@gmail.com can be wired via EmailJS, Formspree,
// Supabase Edge Functions, or a server endpoint when backend is connected.

export type RequestStatus =
  | "New"
  | "Reviewed"
  | "Contacted"
  | "Quotation Sent"
  | "In Progress"
  | "Completed"
  | "Rejected / Not suitable";

export type ServiceRequest = {
  id: string;
  ref: string;
  createdAt: string;
  status: RequestStatus;
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  county: string;
  town: string;
  clientType: string;
  divisionId: string;
  divisionName: string;
  serviceId: string;
  serviceName: string;
  description: string;
  urgency: "Low" | "Medium" | "High";
  followUpMethod: "WhatsApp" | "Phone call" | "Email";
  followUpDate?: string;
  uploadName?: string;
  consent: boolean;
  divisionDetails: Record<string, string>;
  notes?: string;
};

const KEY = "skywave_requests_v1";

const isBrowser = () => typeof window !== "undefined";

export function getRequests(): ServiceRequest[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRequests(list: ServiceRequest[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addRequest(r: Omit<ServiceRequest, "id" | "ref" | "createdAt" | "status">) {
  const ref = "SWN-" + Date.now().toString(36).toUpperCase();
  const full: ServiceRequest = {
    ...r,
    id: crypto.randomUUID(),
    ref,
    createdAt: new Date().toISOString(),
    status: "New",
  };
  const list = getRequests();
  list.unshift(full);
  saveRequests(list);
  return full;
}

export function updateRequest(id: string, patch: Partial<ServiceRequest>) {
  const list = getRequests().map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveRequests(list);
}
