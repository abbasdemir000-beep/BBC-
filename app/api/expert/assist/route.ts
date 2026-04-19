import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getAnalysisModel, isGeminiEnabled } from '@/lib/ai/gemini';

// POST /api/expert/assist
// Body: { question: string, domain: string, expertDraft?: string }
// Returns: sources, keyPoints, suggestions, terminology

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { question: string; domain: string; expertDraft?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { question, domain, expertDraft } = body;
  if (!question || !domain) {
    return NextResponse.json({ error: 'question and domain are required' }, { status: 400 });
  }

  if (!isGeminiEnabled()) {
    return NextResponse.json({
      sources: [],
      keyPoints: ['Gemini API key not configured — expert assistance unavailable.'],
      suggestions: [],
      terminology: [],
      note: 'Set GEMINI_API_KEY environment variable to enable AI expert assistance.',
    });
  }

  const model = getAnalysisModel();

  const prompt = `
You are an expert research assistant for BBC KnowledgeMarket platform.

A domain expert needs assistance answering a consultation question.
Your task: provide high-quality reference material to help them craft a thorough, credible answer.

Domain: ${domain}

Original Question:
"""
${question}
"""

${expertDraft ? `Expert's Draft Answer (help improve this):\n"""\n${expertDraft}\n"""` : 'No draft provided yet.'}

Return this exact JSON schema:
{
  "sources": [
    {
      "title": "string (source/reference name)",
      "type": "journal | textbook | guideline | standard | database | regulation",
      "relevance": "string (why this source is relevant)",
      "keyFinding": "string (most relevant finding from this source)"
    }
  ],
  "keyPoints": ["array of 4-6 critical points the expert must address in their answer"],
  "suggestions": ["array of 3-5 specific suggestions to strengthen the answer"],
  "terminology": [
    {
      "term": "string (domain-specific term)",
      "definition": "string (brief accurate definition)"
    }
  ],
  "warningFlags": ["array of common mistakes or misconceptions to avoid in this topic"]
}

Provide 3-5 sources. Focus on accuracy and credibility.
Return only the JSON object.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const parsed = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''));

    return NextResponse.json({
      sources: parsed.sources ?? [],
      keyPoints: parsed.keyPoints ?? [],
      suggestions: parsed.suggestions ?? [],
      terminology: parsed.terminology ?? [],
      warningFlags: parsed.warningFlags ?? [],
      modelUsed: 'gemini-1.5-pro',
    });
  } catch (err) {
    console.error('[expert/assist]', err);
    return NextResponse.json({ error: 'AI assistance temporarily unavailable' }, { status: 500 });
  }
}
