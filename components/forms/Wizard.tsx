"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCep, maskCep, maskPhone, onlyDigits } from "@/components/forms/utils";

export type FieldType = "text" | "textarea" | "tel" | "cep" | "select" | "multi" | "radio";

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  hint?: string;
  options?: string[];
  highlight?: boolean;
  other?: boolean;
  otherPlaceholder?: string;
  visibleIf?: { field: string; equals: string | string[] };
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "url" | "decimal" | "search" | "none";
  half?: boolean;
  maxLength?: number;
}

export interface Step {
  title: string;
  subtitle?: string;
  fields: Field[];
}

export interface FormValues {
  fields: Record<string, string>;
  multis: Record<string, string[]>;
}

interface WizardProps {
  steps: Step[];
  storageKey: string;
  submitLabel?: string;
  onSubmit: (values: FormValues) => Promise<void>;
}

const inputClass =
  "w-full rounded-xl border border-edge bg-surface px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-brand-400";

function isVisible(field: Field, values: FormValues): boolean {
  if (!field.visibleIf) return true;
  const { field: target, equals } = field.visibleIf;
  const current = values.fields[target] ?? "";
  if (Array.isArray(equals)) return equals.includes(current);
  return current === equals;
}

function validateStep(step: Step, values: FormValues): string[] {
  const errors: string[] = [];
  for (const field of step.fields) {
    if (!isVisible(field, values)) continue;
    if (field.type === "multi") {
      if (field.required && (values.multis[field.id] ?? []).length === 0) {
        errors.push(`Selecione pelo menos uma opção em "${field.label}".`);
      }
      continue;
    }
    const value = (values.fields[field.id] ?? "").trim();
    if (field.required) {
      if (!value) {
        errors.push(`Preencha "${field.label}".`);
      } else if (field.type === "tel" && onlyDigits(value).length < 10) {
        errors.push(`Informe um WhatsApp válido em "${field.label}".`);
      } else if (field.type === "cep" && onlyDigits(value).length !== 8) {
        errors.push(`Informe um CEP válido em "${field.label}".`);
      } else if (field.type === "textarea" && value.length < 5) {
        errors.push(`"${field.label}" precisa de pelo menos alguns caracteres.`);
      } else if (field.type === "select" && field.other && value === "Outro") {
        const outro = (values.fields[`${field.id}Outro`] ?? "").trim();
        if (!outro) errors.push(`Descreva a opção "Outro" em "${field.label}".`);
      }
    }
  }
  return errors;
}

export function Wizard({ steps, storageKey, submitLabel = "Enviar cadastro", onSubmit }: WizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<FormValues>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as FormValues;
        if (parsed && typeof parsed === "object" && parsed.fields && parsed.multis) {
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }
    return { fields: {}, multis: {} };
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [cepBusy, setCepBusy] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [values, storageKey]);

  const step = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  const setField = (id: string, value: string) => {
    setValues((v) => ({ ...v, fields: { ...v.fields, [id]: value } }));
    setErrors([]);
  };

  const toggleMulti = (id: string, option: string) => {
    setValues((v) => {
      const current = v.multis[id] ?? [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...v, multis: { ...v.multis, [id]: next } };
    });
    setErrors([]);
  };

  const handleCep = async (id: string, raw: string) => {
    const cep = maskCep(raw);
    setField(id, cep);
    if (onlyDigits(cep).length !== 8) return;
    setCepBusy(true);
    setNotice("Buscando endereço pelo CEP…");
    const result = await fetchCep(cep);
    setCepBusy(false);
    if (!result) {
      setNotice("CEP não encontrado. Preencha o endereço manualmente.");
      return;
    }
    setValues((v) => ({
      ...v,
      fields: {
        ...v.fields,
        rua: result.rua || v.fields.rua,
        bairro: result.bairro || v.fields.bairro,
        cidade: result.cidade || v.fields.cidade,
        uf: result.uf || v.fields.uf,
      },
    }));
    setNotice(null);
  };

  const next = () => {
    const errs = validateStep(step, values);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setErrors([]);
    setStepIndex((i) => Math.max(i - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    const errs = validateStep(step, values);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setErrors([]);
    try {
      await onSubmit(values);
    } catch (e) {
      console.error(e);
      setNotice("Não foi possível enviar. Verifique sua conexão e tente novamente.");
      setSubmitting(false);
    }
  };

  const renderField = (field: Field) => {
    const value = values.fields[field.id] ?? "";
    const multiValue = values.multis[field.id] ?? [];
    const common = {
      id: field.id,
      "aria-label": field.label,
      required: field.required,
      autoComplete: field.autoComplete,
      inputMode: field.inputMode,
    } as const;

    switch (field.type) {
      case "text":
        return (
          <input
            {...common}
            type="text"
            value={value}
            placeholder={field.placeholder}
            onChange={(e) => setField(field.id, e.target.value)}
            className={inputClass}
          />
        );
      case "tel":
        return (
          <input
            {...common}
            type="tel"
            value={value}
            placeholder={field.placeholder ?? "(00) 00000-0000"}
            onChange={(e) => setField(field.id, maskPhone(e.target.value))}
            className={inputClass}
          />
        );
      case "cep":
        return (
          <div className="flex items-center gap-3">
            <input
              {...common}
              type="text"
              inputMode="numeric"
              value={value}
              placeholder={field.placeholder ?? "00000-000"}
              onChange={(e) => handleCep(field.id, e.target.value)}
              className={inputClass}
            />
            {cepBusy && <span className="text-sm text-brand-600">Buscando…</span>}
          </div>
        );
      case "textarea":
        return (
          <textarea
            {...common}
            value={value}
            placeholder={field.placeholder}
            rows={3}
            onChange={(e) => setField(field.id, e.target.value)}
            className={`${inputClass} resize-none`}
          />
        );
      case "select":
        return (
          <div className="space-y-2">
            <select
              {...common}
              value={value}
              onChange={(e) => setField(field.id, e.target.value)}
              className={`${inputClass} appearance-none ${value ? "" : "text-zinc-400"}`}
            >
              <option value="" disabled>
                {field.placeholder ?? "Selecione…"}
              </option>
              {(field.options ?? []).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            {field.other && value === "Outro" && (
              <input
                type="text"
                aria-label={`${field.label} — outro`}
                value={values.fields[`${field.id}Outro`] ?? ""}
                placeholder={field.otherPlaceholder ?? "Descreva…"}
                onChange={(e) => setField(`${field.id}Outro`, e.target.value)}
                className={inputClass}
              />
            )}
          </div>
        );
      case "multi":
        return (
          <div className="flex flex-wrap gap-2">
            {(field.options ?? []).map((o) => {
              const active = multiValue.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleMulti(field.id, o)}
                  className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                    active
                      ? "bg-brand-gradient border-transparent text-white"
                      : "border-edge bg-surface text-zinc-600 hover:border-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {(field.options ?? []).map((o) => {
              const active = value === o;
              return (
                <button
                  key={o}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setField(field.id, o);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    active
                      ? "border-brand-400 bg-brand-500/10 text-zinc-900"
                      : "border-edge bg-surface text-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      active ? "border-brand-400" : "border-zinc-400"
                    }`}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-brand-400" />}
                  </span>
                  {o}
                </button>
              );
            })}
          </div>
        );
    }
  };

  const visibleFields = useMemo(
    () => step.fields.filter((f) => isVisible(f, values)),
    [step, values],
  );

  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Etapa {stepIndex + 1} de {steps.length} — {step.title}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="bg-brand-gradient h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-zinc-900">{step.title}</h2>
        {step.subtitle && <p className="mt-1 text-sm text-zinc-600">{step.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {visibleFields.map((field) => (
          <div key={field.id} className={field.half || field.type === "multi" || field.type === "radio" || field.type === "textarea" ? "sm:col-span-2" : ""}>
            <label htmlFor={field.id} className="mb-1.5 flex items-baseline justify-between text-sm text-zinc-700">
              <span>
                {field.label}
                {field.required && <span className="ml-0.5 text-brand-600">*</span>}
              </span>
              {field.optional && <span className="text-xs text-zinc-400">opcional</span>}
            </label>
            {field.highlight && (
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                Pergunta-chave — nos ajuda a validar a rede
              </div>
            )}
            {renderField(field)}
            {field.hint && <p className="mt-1.5 text-xs text-zinc-500">{field.hint}</p>}
          </div>
        ))}
      </div>

      {errors.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700">
          <p className="mb-1 font-semibold">Ajuste os campos abaixo:</p>
          <ul className="list-inside list-disc space-y-0.5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {notice && <p className="mt-4 text-sm text-zinc-600">{notice}</p>}

      <div className="mt-8 flex items-center justify-between gap-3">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={back}
            disabled={submitting}
            className="rounded-full border border-edge px-6 py-2.5 text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:opacity-50"
          >
            Voltar
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={stepIndex === steps.length - 1 ? submit : next}
          disabled={submitting}
          className="bg-brand-gradient rounded-full px-7 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Enviando…" : stepIndex === steps.length - 1 ? submitLabel : "Continuar"}
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-zinc-500">
        Seu progresso fica salvo automaticamente neste navegador. Sem custo, sem compromisso.
      </p>
    </div>
  );
}