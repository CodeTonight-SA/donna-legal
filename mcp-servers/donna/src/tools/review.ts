import { z } from "zod";

export const ReviewInputSchema = z.object({
  doc_text: z.string().min(1).describe("Full text of the document to review"),
  redline_target: z.string().min(1).describe("What to redline: 'liability', 'ip', 'payment', 'all'"),
});

export type ReviewInput = z.infer<typeof ReviewInputSchema>;

export interface ReviewResult {
  status: string;
  redline_target: string;
  doc_length: number;
  redlines: string[];
  todo: string;
}

export function review(input: ReviewInput): ReviewResult {
  return {
    status: "scaffolded",
    redline_target: input.redline_target,
    doc_length: input.doc_text.length,
    redlines: [],
    todo: "wire-real-llm-call",
  };
}
