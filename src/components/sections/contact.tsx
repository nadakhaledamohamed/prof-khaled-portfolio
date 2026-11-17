"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  Landmark,
  LoaderCircle,
  Send,
  type LucideIcon,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import type { Dictionary } from "@/content/types";
import {
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactResultCode,
} from "@/lib/contact-schema";
import { arrowNudgeGroup, cn, easeOutExpo, flipRtl } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import type { SocialIcon, SocialLink } from "@/types";

const icons: Record<SocialIcon, LucideIcon> = {
  scholar: GraduationCap,
  university: Landmark,
  foundation: Building2,
};

const empty = { name: "", email: "", subject: "", message: "", company: "" };
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

interface ContactProps {
  t: Dictionary["contact"];
  opensNewTab: string;
  locale: Locale;
  socialLinks: SocialLink[];
}

export function Contact({ t, opensNewTab, locale, socialLinks }: ContactProps) {
  const [values, setValues] = React.useState(empty);
  const [errors, setErrors] = React.useState<ContactErrors>({});
  const [touched, setTouched] = React.useState<Partial<Record<ContactField, boolean>>>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const [result, setResult] = React.useState<ContactResultCode | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  function update(field: keyof typeof empty, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Re-validate live only for fields the visitor has already left once.
    if (field !== "company" && touched[field]) {
      const check = validateContact(next);
      setErrors((prev) => ({ ...prev, [field]: check.ok ? undefined : check.errors[field] }));
    }
  }

  function blur(field: ContactField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const check = validateContact(values);
    setErrors((prev) => ({ ...prev, [field]: check.ok ? undefined : check.errors[field] }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const check = validateContact(values);
    if (!check.ok) {
      setErrors(check.errors);
      setTouched({ name: true, email: true, subject: true, message: true });
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
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: ContactResultCode;
        errors?: ContactErrors;
      } | null;

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

  const fieldProps = (field: ContactField) => ({
    id: `contact-${field}`,
    name: field,
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update(field, e.target.value),
    onBlur: () => blur(field),
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `contact-${field}-error` : undefined,
    required: true,
  });

  const errorText = (field: ContactField) => {
    const code = errors[field];
    return code ? t.errors[code] : undefined;
  };

  return (
    <Section id="contact" className="pb-24 sm:pb-32">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <SectionHeading
            id="contact"
            index="10"
            eyebrow={t.eyebrow}
            title={t.title}
            description={t.description}
            className="mb-10 sm:mb-10"
          />

          <Stagger role="list" className="grid gap-3">
            {socialLinks.map((link) => {
              const Icon = icons[link.icon];
              const copy = t.links[link.icon];
              return (
                <StaggerItem key={link.url} role="listitem">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass group flex items-center gap-4 rounded-2xl p-4 transition-[translate,border-color] duration-500 hover:border-primary/40 ltr:hover:translate-x-1.5 rtl:hover:-translate-x-1.5"
                  >
                    <span className="neu grid size-12 shrink-0 place-items-center rounded-2xl text-primary transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{copy.title}</span>
                      <span className="block text-sm text-muted-foreground">{copy.subtitle}</span>
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className={cn(
                        "size-5 shrink-0 text-muted-foreground transition-[transform,color] duration-300 group-hover:text-primary",
                        arrowNudgeGroup,
                        flipRtl,
                      )}
                    />
                    <span className="sr-only">{opensNewTab}</span>
                  </a>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>

        <Reveal delay={0.1}>
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
                  <h3 className="mt-7 font-display text-3xl font-medium">{t.successTitle}</h3>
                  <p className="mt-3 max-w-sm text-muted-foreground">{t.results[result ?? "sent"]}</p>
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
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="contact-name">{t.name}</Label>
                      <Input {...fieldProps("name")} autoComplete="name" placeholder={t.namePlaceholder} />
                      <FieldError id="contact-name-error" message={errorText("name")} />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">{t.email}</Label>
                      <Input
                        {...fieldProps("email")}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        dir="ltr"
                        className="rtl:text-right"
                        placeholder={t.emailPlaceholder}
                      />
                      <FieldError id="contact-email-error" message={errorText("email")} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact-subject">{t.subject}</Label>
                    <Input {...fieldProps("subject")} placeholder={t.subjectPlaceholder} />
                    <FieldError id="contact-subject-error" message={errorText("subject")} />
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between">
                      <Label htmlFor="contact-message">{t.message}</Label>
                      <span dir="ltr" className="font-mono text-[11px] tabular-nums text-muted-foreground">
                        {values.message.length} / 3000
                      </span>
                    </div>
                    <Textarea
                      {...fieldProps("message")}
                      maxLength={3000}
                      placeholder={t.messagePlaceholder}
                    />
                    <FieldError id="contact-message-error" message={errorText("message")} />
                  </div>

                  {/* Honeypot: visually hidden and skipped by assistive tech; bots tend to fill it. */}
                  <div aria-hidden className="sr-only">
                    <label>
                      {t.honeypot}
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        name="company"
                        value={values.company}
                        onChange={(e) => update("company", e.target.value)}
                      />
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
                      <Button
                        type="submit"
                        size="lg"
                        variant="brand"
                        disabled={status === "submitting"}
                        aria-busy={status === "submitting"}
                      >
                        {status === "submitting" ? (
                          <>
                            <LoaderCircle className="animate-spin" /> {t.sending}
                          </>
                        ) : (
                          <>
                            {t.send}
                            <Send
                              className={cn(
                                "group-hover/btn:-translate-y-0.5 ltr:group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5",
                                flipRtl,
                              )}
                            />
                          </>
                        )}
                      </Button>
                    </Magnetic>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
