// All AI logic moved to smartEngine.ts — no external API calls
export type { SmartEvaluation as EvaluationResult } from './smartEngine';
export { smartEvaluate as evaluateSubmission } from './smartEngine';
