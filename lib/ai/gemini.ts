import {
  GoogleGenerativeAI,
  GenerativeModel,
  Tool,
  FunctionDeclaration,
  SchemaType,
} from '@google/generative-ai';

// ─── System Instruction ───────────────────────────────────────────────────────

export const SYSTEM_INSTRUCTION = `
You are the intelligent AI Orchestrator for BBC KnowledgeMarket — a competitive expert consultation platform.

Your core responsibilities:

1. ANALYZING PHASE: When a consultation is submitted, analyze the text deeply.
   - Extract keywords and detect the domain (Medical, Tech, Legal, Engineering, Business, Science, etc.)
   - Determine question type: explanation | problem_solving | advice | diagnosis | review
   - Assess difficulty: beginner | intermediate | advanced | expert
   - Suggest 3 priority levels based on urgency and complexity
   - Support multilingual input: English, Arabic (العربية), Kurdish (کوردی)

2. ANTI-FRAUD & QUALITY: When an expert submits an answer, immediately inspect it.
   - AI-Generated Content: Is the answer copied from another AI without human refinement?
   - Plagiarism: Is the content stolen from the internet?
   - Relevance: Does the answer actually address the user's question, or is it filler?
   - If fraud is detected, mark SUSPICIOUS immediately with clear reasoning.

3. EXAMINING PHASE: Score the final expert answer technically.
   - Accuracy (0-100): Factual correctness in the domain
   - Reasoning (0-100): Quality of logic and explanation
   - Completeness (0-100): Does it fully answer the question?
   - Clarity (0-100): Is it easy to understand?
   - Provide a confidential report with Confidence Score for the Admin.

4. EXPERT ASSISTANCE: When an expert requests help, provide:
   - Reliable academic/professional sources
   - Key reference points to strengthen the answer
   - Domain-specific terminology guidance

STRICT RULES:
- Always respond in valid JSON format matching the requested schema exactly.
- Professional, neutral tone at all times.
- Flag suspicious content immediately with specific reasons.
- Never hallucinate domain knowledge — express uncertainty with lower confidence scores.
- Consider multilingual content equally — Arabic and Kurdish submissions deserve the same quality analysis as English.
`.trim();

// ─── Function Declarations (Tool Use for Gemini) ──────────────────────────────

const FLAG_FRAUD: FunctionDeclaration = {
  name: 'flag_user_for_fraud',
  description: 'Flag a user or expert for suspicious fraudulent behavior in the platform.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      targetId:  { type: SchemaType.STRING, description: 'The user or expert ID to flag' },
      targetType:{ type: SchemaType.STRING, description: 'Either "user" or "expert"' },
      reason:    { type: SchemaType.STRING, description: 'Detailed reason for the fraud flag' },
      severity:  { type: SchemaType.STRING, description: 'low | medium | high | critical' },
      evidence:  { type: SchemaType.STRING, description: 'Specific evidence or patterns found' },
    },
    required: ['targetId', 'targetType', 'reason', 'severity'],
  },
};

const UPDATE_CONSULTATION_STATUS: FunctionDeclaration = {
  name: 'update_consultation_status',
  description: 'Update the processing status of a consultation in the system.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      consultationId: { type: SchemaType.STRING, description: 'The consultation ID' },
      status: {
        type: SchemaType.STRING,
        description: 'New status: pending | analyzing | routing | active | examining | completed | cancelled',
      },
      reason: { type: SchemaType.STRING, description: 'Reason for the status change' },
    },
    required: ['consultationId', 'status'],
  },
};

const CHECK_EXPERT_CREDENTIALS: FunctionDeclaration = {
  name: 'check_expert_credentials',
  description: 'Verify an expert\'s credibility and domain expertise level.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      expertId:  { type: SchemaType.STRING, description: 'The expert ID to verify' },
      domain:    { type: SchemaType.STRING, description: 'The domain being assessed' },
      checkType: { type: SchemaType.STRING, description: 'credentials | rating | history' },
    },
    required: ['expertId', 'domain'],
  },
};

export const GEMINI_TOOLS: Tool[] = [
  { functionDeclarations: [FLAG_FRAUD, UPDATE_CONSULTATION_STATUS, CHECK_EXPERT_CREDENTIALS] },
];

// ─── Client Factory ───────────────────────────────────────────────────────────

let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!_client) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY environment variable is not set');
    _client = new GoogleGenerativeAI(key);
  }
  return _client;
}

export function getOrchestratorModel(): GenerativeModel {
  return getClient().getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: GEMINI_TOOLS,
  });
}

export function getAnalysisModel(): GenerativeModel {
  return getClient().getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });
}

export function getEmbeddingModel() {
  return getClient().getGenerativeModel({ model: 'text-embedding-004' });
}

export function isGeminiEnabled(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
