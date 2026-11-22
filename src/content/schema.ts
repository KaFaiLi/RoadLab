import { z } from "zod";
export const locales = ["en", "zh-Hant", "ja"] as const;
export type Locale = (typeof locales)[number];
const line = z.string().trim().min(1);
export const translation = z.object({ en: line, "zh-Hant": line, ja: line });
export type Text = z.infer<typeof translation>;
export function tr(en: string, zh: string, ja: string): Text {
  return { en, "zh-Hant": zh, ja };
}
export const categories = [
  "regulatory",
  "warning",
  "indication",
  "guide",
  "supplementary",
  "marking",
  "signal",
  "obligation",
  "winter",
] as const;
export const ruleSchema = z.object({
  id: line,
  name: translation,
  category: z.enum(categories),
  meaning: translation,
  section: line,
  source: z.enum(["npa", "mlit", "winter"]),
  checked: z.iso.date(),
  vehicle: z.literal("passenger-car"),
  region: z.enum(["Japan", "Hokkaido"]),
  status: z.enum(["verified", "pending"]),
  kind: z.enum(["rule", "guidance", "information"]),
  asset: line.optional(),
  attribution: line.optional(),
});
export const questionSchema = z.object({
  id: line,
  rule: line,
  prompt: translation,
  options: z.array(z.object({ id: line, text: translation })).min(2),
  correct: line,
  difficulty: z.enum(["basic", "applied"]),
  scene: line.optional(),
  status: z.enum(["verified", "pending"]),
});
export type Rule = z.infer<typeof ruleSchema>;
export type Question = z.infer<typeof questionSchema>;
