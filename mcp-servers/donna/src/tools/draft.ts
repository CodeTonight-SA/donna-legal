import { z } from "zod";

export const DraftInputSchema = z.object({
  template: z.string().min(1).describe("Template identifier, e.g. 'nda', 'service-agreement'"),
  fields: z.record(z.string()).describe("Key-value map of template fields to populate"),
});

export type DraftInput = z.infer<typeof DraftInputSchema>;

export interface DraftResult {
  status: string;
  template: string;
  fields_received: number;
  draft_text: string;
  todo: string;
}

export function draft(input: DraftInput): DraftResult {
  return {
    status: "scaffolded",
    template: input.template,
    fields_received: Object.keys(input.fields).length,
    draft_text: "",
    todo: "wire-real-llm-call",
  };
}
