import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { divisions, findDivision, findService } from "@/data/divisions";
import { submitServiceRequest } from "@/lib/requests";
import { whatsappLink } from "@/lib/whatsapp";
import { useMemo, useState } from "react";
import { z } from "zod";
import { CheckCircle2, MessageCircle } from "lucide-react";

const searchSchema = z.object({
  division: z.string().optional(),
  service: z.string().optional(),
});

export const Route = createFileRoute("/request")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Request a Service — SKYWAVE NEXUS Integrated Solutions" },
      { name: "description", content: "Tell us what you need. SKYWAVE NEXUS will follow up with a quotation." },
    ],
  }),
  component: RequestPage,
});

const clientTypes = ["Individual","Farmer","SME","Company","School","Hotel","Processor","Cyber café","Institution","Other"];
const counties = ["Nyeri","Nairobi","Kiambu","Murang'a","Kirinyaga","Embu","Meru","Laikipia","Nakuru","Mombasa","Kisumu","Other"];

function RequestPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState<{ ref: string } | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [busy, setBusy] = useState(false);

  const [divisionId, setDivisionId] = useState<string>(search.division || "");
  const [serviceId, setServiceId] = useState<string>(search.service || "");

  const division = useMemo(() => findDivision(divisionId), [divisionId]);
  const service = useMemo(() => (divisionId && serviceId ? findService(divisionId, serviceId) : undefined), [divisionId, serviceId]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;

    const baseSchema = z.object({
      fullName: z.string().trim().min(2, "Full name is required").max(100),
      phone: z.string().trim().min(7, "Phone is required").max(20),
      whatsapp: z.string().trim().min(7, "WhatsApp number is required").max(20),
      email: z.string().trim().email("Valid email required").max(255),
      county: z.string().min(1, "County is required"),
      town: z.string().trim().min(1, "Town/location is required").max(100),
      clientType: z.string().min(1, "Select a client type"),
      divisionId: z.string().min(1, "Select a division"),
      serviceId: z.string().min(1, "Select a service"),
      description: z.string().trim().min(10, "Describe what you need (min 10 chars)").max(2000),
      urgency: z.enum(["Low","Medium","High"]),
      followUpMethod: z.enum(["WhatsApp","Phone call","Email"]),
      followUpDate: z.string().optional(),
      consent: z.literal("on", { message: "Consent is required" }),
    });

    const parsed = baseSchema.safeParse({ ...data, divisionId, serviceId });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[issue.path.join(".")] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});

    const divisionDetails: Record<string, string> = {};
    for (const [k, v] of fd.entries()) {
      if (k.startsWith("dd_") && typeof v === "string" && v.trim()) {
        divisionDetails[k.replace(/^dd_/, "")] = v;
      }
    }

    const upload = fd.get("upload");
    const file = upload instanceof File && upload.size > 0 ? upload : null;

    const div = findDivision(divisionId);
    const svc = findService(divisionId, serviceId);

    setBusy(true);
    try {
      const created = await submitServiceRequest({
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        whatsapp: parsed.data.whatsapp,
        email: parsed.data.email,
        county: parsed.data.county,
        town: parsed.data.town,
        clientType: parsed.data.clientType,
        divisionId,
        divisionName: div?.title || "",
        serviceId,
        serviceName: svc?.name || "",
        description: parsed.data.description,
        urgency: parsed.data.urgency,
        followUpMethod: parsed.data.followUpMethod,
        followUpDate: parsed.data.followUpDate,
        divisionDetails,
        file,
      });
      setSubmitted({ ref: created.ref });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <CheckCircle2 className="mx-auto size-14 text-brand-green" />
          <h1 className="mt-4 text-2xl font-bold">Request received</h1>
          <p className="mt-3 text-muted-foreground">
            Your request has been received. SKYWAVE NEXUS Integrated Solutions will review your details and contact you with a quotation or next steps.
          </p>
          <div className="mt-6 rounded-xl border bg-secondary p-4 text-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Reference Number</div>
            <div className="text-lg font-bold text-brand-navy">{submitted.ref}</div>
            <div className="mt-2 text-xs text-muted-foreground">Keep this reference to check status on the Track page.</div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={whatsappLink(`Hello SKYWAVE NEXUS, my request reference is ${submitted.ref}.`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">
              <MessageCircle className="size-4" /> WhatsApp Us
            </a>
            <Link to="/track" className="rounded-md border px-5 py-3 text-sm font-semibold">Track Request</Link>
            <Link to="/" className="rounded-md border px-5 py-3 text-sm font-semibold">Return to Homepage</Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h1 className="text-3xl font-bold sm:text-4xl">Request a Service</h1>
          <p className="mt-2 text-white/85">Fill in the form and our team will follow up with a quotation.</p>
        </div>
      </section>

      <form onSubmit={onSubmit} className="mx-auto w-full max-w-5xl space-y-8 px-4 py-12">
        <fieldset className="rounded-2xl border bg-card p-6 shadow-soft">
          <legend className="px-2 text-sm font-semibold text-brand-blue">What you need</legend>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Division" error={errors.divisionId}>
              <select
                value={divisionId}
                onChange={(e) => { setDivisionId(e.target.value); setServiceId(""); navigate({ to: "/request", search: { division: e.target.value, service: undefined } }); }}
                className="input"
              >
                <option value="">Select a division</option>
                {divisions.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </Field>
            <Field label="Service" error={errors.serviceId}>
              <select
                value={serviceId}
                onChange={(e) => { setServiceId(e.target.value); navigate({ to: "/request", search: { division: divisionId, service: e.target.value } }); }}
                className="input"
                disabled={!division}
              >
                <option value="">{division ? "Select a service" : "Select division first"}</option>
                {division?.services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          </div>
          {service && (
            <p className="mt-3 rounded-lg bg-secondary p-3 text-sm">
              <strong>{service.name}:</strong> {service.explanation}
            </p>
          )}
        </fieldset>

        <fieldset className="rounded-2xl border bg-card p-6 shadow-soft">
          <legend className="px-2 text-sm font-semibold text-brand-blue">Your details</legend>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full name" error={errors.fullName}><input name="fullName" className="input" maxLength={100} required /></Field>
            <Field label="Phone number" error={errors.phone}><input name="phone" type="tel" className="input" maxLength={20} required /></Field>
            <Field label="WhatsApp number" error={errors.whatsapp}><input name="whatsapp" type="tel" className="input" maxLength={20} required /></Field>
            <Field label="Email address" error={errors.email}><input name="email" type="email" className="input" maxLength={255} required /></Field>
            <Field label="County" error={errors.county}>
              <select name="county" className="input" required>
                <option value="">Select county</option>
                {counties.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Town / location" error={errors.town}><input name="town" className="input" maxLength={100} required /></Field>
            <Field label="Type of client" error={errors.clientType}>
              <select name="clientType" className="input" required>
                <option value="">Select type</option>
                {clientTypes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border bg-card p-6 shadow-soft">
          <legend className="px-2 text-sm font-semibold text-brand-blue">Request details</legend>
          <Field label="Describe what you need" error={errors.description}>
            <textarea name="description" rows={4} className="input" maxLength={2000} required />
          </Field>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <Field label="Urgency level" error={errors.urgency}>
              <select name="urgency" className="input" required defaultValue="Medium">
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </Field>
            <Field label="Preferred follow-up" error={errors.followUpMethod}>
              <select name="followUpMethod" className="input" required defaultValue="WhatsApp">
                <option>WhatsApp</option><option>Phone call</option><option>Email</option>
              </select>
            </Field>
            <Field label="Preferred follow-up date">
              <input name="followUpDate" type="date" className="input" />
            </Field>
          </div>
        </fieldset>

        {divisionId === "food-safety" && (
          <DynamicSection title="Food Safety details">
            <Field label="Type of food business"><input name="dd_foodBusinessType" className="input" /></Field>
            <Field label="Product handled"><input name="dd_product" className="input" /></Field>
            <Field label="Existing permits or certification?"><input name="dd_permits" className="input" placeholder="Yes / No / Which" /></Field>
            <Field label="Number of staff to be trained"><input name="dd_staffCount" type="number" min={0} className="input" /></Field>
            <Field label="What do you need?">
              <select name="dd_needType" className="input">
                <option value="">Select</option><option>Documents</option><option>Training</option><option>Audit</option><option>Full setup</option>
              </select>
            </Field>
            <Field label="Existing SOPs or records?"><input name="dd_existingSops" className="input" placeholder="Yes / No / Partially" /></Field>
          </DynamicSection>
        )}
        {divisionId === "value-addition" && (
          <DynamicSection title="Value Addition details">
            <Field label="Product you want to develop"><input name="dd_product" className="input" /></Field>
            <Field label="Current stage">
              <select name="dd_stage" className="input">
                <option value="">Select</option><option>Idea</option><option>Trial</option><option>Already producing</option><option>Ready for market</option>
              </select>
            </Field>
            <Field label="Main raw materials"><input name="dd_rawMaterials" className="input" /></Field>
            <Field label="Packaging type needed"><input name="dd_packaging" className="input" /></Field>
            <Field label="Expected production scale"><input name="dd_scale" className="input" /></Field>
            <Field label="Main challenge"><input name="dd_challenge" className="input" /></Field>
          </DynamicSection>
        )}
        {divisionId === "isp-connectivity" && (
          <DynamicSection title="Connectivity details">
            <Field label="Exact location or landmark"><input name="dd_location" className="input" /></Field>
            <Field label="Number of users / devices"><input name="dd_users" type="number" min={0} className="input" /></Field>
            <Field label="Current internet provider (if any)"><input name="dd_currentISP" className="input" /></Field>
            <Field label="Main problem">
              <select name="dd_mainProblem" className="input">
                <option value="">Select</option>
                <option>Slow internet</option><option>No coverage</option><option>Router issue</option>
                <option>Hotspot setup</option><option>Printer issue</option><option>CCTV/network setup</option><option>Other</option>
              </select>
            </Field>
            <Field label="Reliable power available?"><input name="dd_power" className="input" placeholder="Yes / No" /></Field>
            <Field label="Need a site survey?"><input name="dd_siteSurvey" className="input" placeholder="Yes / No" /></Field>
          </DynamicSection>
        )}

        <fieldset className="rounded-2xl border bg-card p-6 shadow-soft">
          <legend className="px-2 text-sm font-semibold text-brand-blue">Optional upload</legend>
          <input
            name="upload"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,.doc,.docx,.xls,.xlsx"
            className="block w-full text-sm"
          />
          <p className="mt-2 text-xs text-muted-foreground">Images, PDF, or Office docs only. Max 10 MB.</p>
        </fieldset>

        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <label className="flex items-start gap-3 text-sm">
            <input name="consent" type="checkbox" className="mt-1 size-4" />
            <span>I agree to be contacted by SKYWAVE NEXUS Integrated Solutions regarding this request.</span>
          </label>
          {errors.consent && <p className="mt-2 text-xs text-destructive">{errors.consent}</p>}
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className="rounded-md bg-brand-blue px-6 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60">
            {busy ? "Submitting…" : "Submit Request"}
          </button>
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border px-6 py-3 text-sm font-semibold">
            <MessageCircle className="size-4" /> Or chat on WhatsApp
          </a>
        </div>
      </form>

      <Footer />

      <style>{`.input{ width:100%; border:1px solid var(--color-border); background:var(--color-background); border-radius:0.5rem; padding:0.6rem 0.75rem; font-size:0.9rem; outline:none; transition:border-color .15s, box-shadow .15s; } .input:focus{ border-color:var(--color-ring); box-shadow:0 0 0 3px color-mix(in oklab, var(--color-ring) 25%, transparent); }`}</style>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-foreground/80">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function DynamicSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border bg-card p-6 shadow-soft">
      <legend className="px-2 text-sm font-semibold text-brand-blue">{title}</legend>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}
