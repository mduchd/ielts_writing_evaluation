import { NextRequest, NextResponse } from 'next/server';
import { evaluateEssayWithAI } from '@/lib/evaluator';
import { Topic } from '@/types/ielts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { essay, topic, timeSpentSeconds, apiKey, provider } = body;

    if (!essay || typeof essay !== 'string') {
      return NextResponse.json({ error: 'Essay content is required' }, { status: 400 });
    }

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Read server-side environment variables if not passed from client
    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    const effectiveProvider = provider || (process.env.GEMINI_API_KEY ? 'gemini' : 'gemini');

    const result = await evaluateEssayWithAI(
      essay,
      topic as Topic,
      timeSpentSeconds || 0,
      effectiveApiKey,
      effectiveProvider
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error during evaluation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal evaluation failure';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
