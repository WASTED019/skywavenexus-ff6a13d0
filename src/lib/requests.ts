import { supabase } from "@/integrations/supabase/client";

export type ServiceRequestInput = {
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
  divisionDetails: Record<string, string>;
  file?: File | null;
};

export type CreatedRequest = {
  id: string;
  ref: string;
};

function makeRef() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `SWN-${s}`;
}

export async function submitServiceRequest(input: ServiceRequestInput): Promise<CreatedRequest> {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? null;

  // Try a few times in the unlikely case of a ref collision
  let ref = makeRef();
  let row: { id: string; ref: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase.from("service_requests").insert({
      ref,
      user_id: userId,
      full_name: input.fullName,
      phone: input.phone,
      whatsapp: input.whatsapp,
      email: input.email,
      county: input.county,
      town: input.town,
      client_type: input.clientType,
      division_id: input.divisionId,
      division_name: input.divisionName,
      service_id: input.serviceId,
      service_name: input.serviceName,
      description: input.description,
      urgency: input.urgency,
      follow_up_method: input.followUpMethod,
      follow_up_date: input.followUpDate || null,
      division_details: input.divisionDetails,
    }).select("id, ref").single();

    if (!error && data) { row = data; break; }
    if (error?.code === "23505") { ref = makeRef(); continue; }
    throw new Error(error?.message || "Failed to submit request");
  }
  if (!row) throw new Error("Failed to submit request");

  // Upload file (optional). Failure here should not block the request.
  if (input.file && input.file.size > 0) {
    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    const ALLOWED_MIME = new Set([
      "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]);
    const ALLOWED_EXT = /\.(png|jpe?g|webp|gif|pdf|docx?|xlsx?)$/i;
    if (input.file.size > MAX_BYTES) {
      throw new Error("Attachment is larger than the 10 MB limit.");
    }
    const mimeOk = !input.file.type || ALLOWED_MIME.has(input.file.type);
    const extOk = ALLOWED_EXT.test(input.file.name);
    if (!mimeOk || !extOk) {
      throw new Error("Unsupported file type. Allowed: images, PDF, Word, Excel.");
    }
    try {
      const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${row.id}/${Date.now()}_${safeName}`;
      const { error: upErr } = await supabase.storage.from("request-uploads").upload(path, input.file, {
        contentType: input.file.type || undefined,
        upsert: false,
      });
      if (!upErr) {
        await supabase.from("request_files").insert({
          request_id: row.id,
          storage_path: path,
          original_name: input.file.name,
          mime_type: input.file.type || null,
          size_bytes: input.file.size,
        });
      }
    } catch {
      // swallow — request itself succeeded
    }
  }

  return row;
}
