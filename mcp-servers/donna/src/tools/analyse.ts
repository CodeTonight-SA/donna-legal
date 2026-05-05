import { z } from "zod";

export const AnalyseInputSchema = z.object({
  doc_text: z.string().min(1).describe("Full text of the legal document to analyse"),
  jurisdiction: z.string().min(1).describe("Jurisdiction code, e.g. 'ZA', 'UK', 'US-CA'"),
});

export type AnalyseInput = z.infer<typeof AnalyseInputSchema>;

export interface AnalyseResult {
  status: string;
  jurisdiction: string;
  doc_length: number;
  findings: string[];
  todo: string;
}

export function analyse(input: AnalyseInput): AnalyseResult {
  return {
    status: "scaffolded",
    jurisdiction: input.jurisdiction,
    doc_length: input.doc_text.length,
    findings: [],
    todo: "wire-real-llm-call",
  };
}
