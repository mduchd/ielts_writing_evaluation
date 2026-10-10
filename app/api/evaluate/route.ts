import { NextRequest, NextResponse } from 'next/server';
import { EvaluationProviderError, evaluateEssayWithAI } from '@/lib/evaluator';
import { Topic } from '@/types/ielts';

const MAX_ESSAY_LENGTH = 30_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTopic(value: unknown): value is Topic {
  if (!isRecord(value)) return false;

  const hasRequiredText = ['id', 'category', 'title', 'prompt'].every(
    (field) => typeof value[field] === 'string' && value[field].trim().length > 0
  );
  const chartDataIsValid =
    value.chartDataSummary === undefined ||
    (Array.isArray(value.chartDataSummary) && value.chartDataSummary.every((item) => typeof item === 'string'));

  return (
    hasRequiredText &&
    (value.type === 'task1' || value.type === 'task2') &&
    typeof value.minWords === 'number' &&
    Number.isFinite(value.minWords) &&
    value.minWords > 0 &&
    typeof value.timeLimitMinutes === 'number' &&
    Number.isFinite(value.timeLimitMinutes) &&
    value.timeLimitMinutes > 0 &&
    (value.chartDescription === undefined || typeof value.chartDescription === 'string') &&
    chartDataIsValid
  );
}

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'Request body must be an object' }, { status: 400 });
  }

  try {
    const { essay, topic, timeSpentSeconds, apiKey, provider } = body;

    if (typeof essay !== 'string' || essay.trim().length === 0) {
      return NextResponse.json({ error: 'Essay content is required' }, { status: 400 });
    }

    if (essay.length > MAX_ESSAY_LENGTH) {
      return NextResponse.json(
        { error: `Essay content must be ${MAX_ESSAY_LENGTH.toLocaleString()} characters or fewer` },
        { status: 413 }
      );
    }

    if (!isTopic(topic)) {
      return NextResponse.json({ error: 'Topic is invalid' }, { status: 400 });
    }

    if (provider !== undefined && provider !== 'gemini' && provider !== 'openai') {
      return NextResponse.json({ error: 'Provider must be gemini or openai' }, { status: 400 });
    }

    const configuredProvider = process.env.GEMINI_API_KEY
      ? 'gemini'
      : process.env.OPENAI_API_KEY
        ? 'openai'
        : 'gemini';
    const clientApiKey = typeof apiKey === 'string' && apiKey.trim() ? apiKey : undefined;
    const selectedProviderHasServerKey = provider === 'gemini'
      ? Boolean(process.env.GEMINI_API_KEY)
      : provider === 'openai'
        ? Boolean(process.env.OPENAI_API_KEY)
        : false;
    const effectiveProvider = clientApiKey
      ? provider ?? configuredProvider
      : selectedProviderHasServerKey && provider
        ? provider
        : configuredProvider;
    const effectiveApiKey = clientApiKey ?? (
      effectiveProvider === 'openai' ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY
    );
    const normalizedTimeSpent =
      typeof timeSpentSeconds === 'number' && Number.isFinite(timeSpentSeconds)
        ? Math.max(0, Math.min(timeSpentSeconds, 24 * 60 * 60))
        : 0;

    const result = await evaluateEssayWithAI(
      essay,
      topic,
      normalizedTimeSpent,
      effectiveApiKey,
      effectiveProvider
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error during evaluation:', error);
    if (error instanceof EvaluationProviderError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: 'Unable to evaluate this essay right now' }, { status: 500 });
  }
}
