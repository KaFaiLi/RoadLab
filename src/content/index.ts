import rawRules from "./rules.json";
import rawQuestions from "./questions.json";
import { ruleSchema, questionSchema, type Question, type Rule } from "./schema";
import { scenes } from "./scenes";
export function validate(rawR: unknown, rawQ: unknown) {
  const rules = ruleSchema.array().parse(rawR),
    questions = questionSchema.array().parse(rawQ);
  function unique(ids: string[]) {
    if (new Set(ids).size !== ids.length) throw Error("Duplicate ID");
  }
  unique(rules.map((r) => r.id));
  unique(questions.map((q) => q.id));
  for (const q of questions) {
    const r = rules.find((r) => r.id === q.rule);
    if (!r || (q.status === "verified" && r.status !== "verified"))
      throw Error("Invalid rule reference: " + q.id);
    unique(q.options.map((o) => o.id));
    if (
      !q.options.some((o) => o.id === q.correct) ||
      (q.scene && !Object.hasOwn(scenes, q.scene))
    )
      throw Error("Invalid question: " + q.id);
  }
  for (const r of rules)
    if (r.asset && !r.attribution) throw Error("Missing credit: " + r.id);
  return { rules, questions };
}
const checked = validate(rawRules, rawQuestions);
export const rules: Rule[] = checked.rules.filter(
  (r) => r.status === "verified",
);
export const questions: Question[] = checked.questions.filter(
  (q) => q.status === "verified",
);
export const ruleFor = (q: Question) => rules.find((r) => r.id === q.rule)!;
