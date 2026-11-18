"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, LoaderCircle, Send } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import type { Dictionary } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { validateContact, type ContactErrors, type ContactField, type ContactResultCode } from "@/lib/contact-schema";
import { cn, easeOutExpo, flipRtl } from "@/lib/utils";

type ConsultType = keyof Dictionary["consultPage"]["types"];
const consultTypes: ConsultType[] = ["research", "knowledge", "technical", "technology", "other"];

const empty = { name: "", email: "", subject: "", message: "", company: "", phone: "", organization: "" };
type Values = typeof empty;
type Status = "idle" | "submitting" | "success" | "error";

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          role="alert"
          className="mt-2 flex items-center gap-1.5 overflow-hidden text-sm text-destructive"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
        >
          <CircleAlert className="size-3.5 shrink-0" aria-hidden />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

interface ContactFormProps {
  t: Dictionary["contact"];
  locale: Locale;
  /** Consultation mode: adds request type, phone and organisation. */
  consult?: Dictionary["consultPage"];
}

/** Validated contact / consultation form. Messages are stored in the admin inbox. */
export function ContactForm({ t, locale, consult }: ContactFormProps) {
  const [values, setValues] = React.useState<Values>(empty);
  const [type, setType] = React.useState<ConsultType>("research");
  const [errors, setErrors] = React.useState<ContactErrors>({});
  const [touched, setTouched] = React.useState<Partial<Record<ContactField, boolean>>>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const [result, setResult] = React.useState<ContactResultCode | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const prefix = consult ? "consult" : "contact";

  const payload = (v: Values) =>
    consult ? { ...v, kind: "consult" as const, consultType: type } : { name: v.name, email: v.email, subject: v.subject, message: v.message, company: v.company };

  function update(field: keyof Values, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Re-validate live only for fields the visitor has already left once.
    if (field !== "company" && touched[field as ContactField]) {
      const check = validateContact(payload(next));
      setErrors((prev) => ({ ...prev, [field]: check.ok ? undefined : check.errors[field as ContactField] }));
    }
  }

  function blur(field: ContactField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const check = validateContact(payload(values));
    setErrors((prev) => ({ ...prev, [field]: check.ok ? undefined : check.errors[field] }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const check = validateContact(payload(values));
    if (!check.ok) {
      setErrors(check.errors);
      setTouched({ name: true, email: true, subject: true, message: true, phone: true, organization: true });
      const first = (Object.keys(check.errors) as ContactField[])[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("submitting");
    setResult(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...check.data, locale }),
      });
      const body = (await response.json().catch(() => null)) as { ok?: boolean; code?: ContactResultCode; errors?: ContactErrors } | null;

      if (response.ok && body?.ok) {
        setStatus("success");
        setResult(body.code ?? "sent");
        setValues(empty);
        setTouched({});
        setErrors({});
        return;
      }
      if (body?.errors) setErrors(body.errors);
      setResult(body?.code && body.code in t.results ? body.code : "unknown");
      setStatus("error");
    } catch {
      setResult("network");
      setStatus("error");
    }
  }

  const fieldProps = (field: ContactField, required = true) => ({
    id: `${prefix}-${field}`,
    name: field,
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(field, e.target.value),
    onBlur: () => blur(field),
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${prefix}-${field}-error` : undefined,
    required,
  });

  const errorText = (field: ContactField) => {
    const code = errors[field];
    return code ? t.errors[code] : undefined;
  };

  const optional = (label: string) =>
    consult ? (
      <>
        {label} <span className="font-normal text-muted-foreground">({consult.optional})</span>
      </>
    ) : (
      label
    );

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-9">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            role="status"
            className="flex min-h-[28rem] flex-col items-center justify-center text-center"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            <motion.span
              className="bg-brand grid size-20 place-items-center rounded-full text-white dark:text-[#070a12]"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.1 }}
            >
              <CheckCircle2 className="size-9" aria-hidden />
            </motion.span>
            <h3 className="mt-7 font-display text-3xl font-medium">{consult ? consult.successTitle : t.successTitle}</h3>
            <p className="mt-3 max-w-sm text-muted-foreground">{consult && result === "sent" ? consult.successText : t.results[result ?? "sent"]}</p>
            <Button variant="outline" className="mt-8" onClick={() => setStatus("idle")}>
              {t.sendAnother}
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            noValidate
            onSubmit={onSubmit}
            aria-label={t.formLabel}
            className="grid gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {consult && (
              <fieldset>
                <legend className="mb-2 block text-sm font-medium">{consult.type}</legend>
                <div className="flex flex-wrap gap-2">
                  {consultTypes.map((id) => (
                    <label
                      key={id}
                      className={cn(
                        "relative cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                        type === id ? "border-transparent bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <input type="radio" name="consultType" value={id} checked={type === id} onChange={() => setType(id)} className="sr-only" />
                      {consult.types[id]}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor={`${prefix}-name`}>{t.name}</Label>
                <Input {...fieldProps("name")} autoComplete="name" placeholder={t.namePlaceholder} />
                <FieldError id={`${prefix}-name-error`} message={errorText("name")} />
              </div>
              <div>
                <Label htmlFor={`${prefix}-email`}>{t.email}</Label>
                <Input {...fieldProps("email")} type="email" inputMode="email" autoComplete="email" dir="ltr" className="rtl:text-right" placeholder={t.emailPlaceholder} />
                <FieldError id={`${prefix}-email-error`} message={errorText("email")} />
              </div>
            </div>

            {consult && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`${prefix}-phone`}>{optional(consult.phone)}</Label>
                  <Input {...fieldProps("phone", false)} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" className="rtl:text-right" placeholder={consult.phonePlaceholder} />
                  <FieldError id={`${prefix}-phone-error`} message={errorText("phone")} />
                </div>
                <div>
                  <Label htmlFor={`${prefix}-organization`}>{optional(consult.organization)}</Label>
                  <Input {...fieldProps("organization", false)} autoComplete="organization" placeholder={consult.organizationPlaceholder} />
                  <FieldError id={`${prefix}-organization-error`} message={errorText("organization")} />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor={`${prefix}-subject`}>{t.subject}</Label>
              <Input {...fieldProps("subject")} placeholder={t.subjectPlaceholder} />
              <FieldError id={`${prefix}-subject-error`} message={errorText("subject")} />
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <Label htmlFor={`${prefix}-message`}>{consult ? consult.details : t.message}</Label>
                <span dir="ltr" className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {values.message.length} / 3000
                </span>
              </div>
              <Textarea {...fieldProps("message")} maxLength={3000} placeholder={consult ? consult.detailsPlaceholder : t.messagePlaceholder} />
              <FieldError id={`${prefix}-message-error`} message={errorText("message")} />
            </div>

            {/* Honeypot: visually hidden and skipped by assistive tech; bots tend to fill it. */}
            <div aria-hidden className="sr-only">
              <label>
                {t.honeypot}
                <input tabIndex={-1} autoComplete="off" name="company" value={values.company} onChange={(e) => update("company", e.target.value)} />
              </label>
            </div>

            <AnimatePresence initial={false}>
              {status === "error" && result && (
                <motion.p
                  role="alert"
                  className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {t.results[result]}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <p className="text-xs text-muted-foreground">{t.required}</p>
              <Magnetic strength={0.25}>
                <Button type="submit" size="lg" variant="brand" disabled={status === "submitting"} aria-busy={status === "submitting"}>
                  {status === "submitting" ? (
                    <>
                      <LoaderCircle className="animate-spin" /> {t.sending}
                    </>
                  ) : (
                    <>
                      {consult ? consult.submit : t.send}
                      <Send className={cn("group-hover/btn:-translate-y-0.5 ltr:group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5", flipRtl)} />
                    </>
                  )}
                </Button>
              </Magnetic>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
