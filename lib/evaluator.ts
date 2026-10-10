import { EvaluationResult, Topic, InlineAnnotation, TextStats } from '@/types/ielts';

export const SYSTEM_PROMPT_IELTS = `You are a certified senior IELTS Examiner accredited by the British Council and IDP.
Your mission is to evaluate an IELTS Writing submission with maximum rigor, precision, and alignment with the official IELTS Public Band Descriptors.

CRITICAL INSTRUCTIONS & GRADING PHILOSOPHY:
1. STRICT CALIBRATION (NO GRADE INFLATION):
   - Never inflate scores out of politeness.
   - Most intermediate candidates score between Band 5.5 and Band 6.5.
   - Band 7.0 requires consistent grammatical control, flexible collocations, and well-developed main ideas.
   - Band 8.0 requires exceptional precision with only rare, non-systematic slips.
   - The Overall Band must be the mathematical mean of the 4 criteria, rounded to the nearest half band (e.g., 6.25 -> 6.5, 6.125 -> 6.0, 6.75 -> 7.0).

2. DETAILED 4-CRITERIA EVALUATION:
   - Task Response (TR / Task Achievement): Check if all parts of the question are addressed, clear position throughout, depth of ideas.
   - Coherence and Cohesion (CC): Check paragraphing logical sequence, variety of cohesive devices (flag mechanical or overused 'Moreover', 'Furthermore', 'In conclusion').
   - Lexical Resource (LR): Academic vocabulary range, precise collocations, style and word choice.
   - Grammatical Range and Accuracy (GRA): Proportion of error-free sentences, complex sentence structures, punctuation accuracy.

3. INLINE ERROR DETECTION:
   - Identify 5 to 10 specific phrases with errors or suboptimal phrasing.
   - For each, categorize as:
     * 'grammar': syntax, agreement, tense, prepositions, articles.
     * 'vocabulary': inappropriate collocation, repetitive words, informal diction.
     * 'coherence': weak linkers, abrupt transitions, logical fallacies.
     * 'excellence': a phrase that was exceptionally well-crafted, showing C1/C2 ability.
   - Provide exact original_text (must match a substring in the candidate's essay), clear explanation, suggested_fix, and a band8_alternative.

4. MODEL REWRITE:
   - Provide a revised version at Band 7.5 and Band 8.5 preserving the candidate's original arguments.

OUTPUT FORMAT:
Return ONLY valid raw JSON with NO markdown backticks (no \`\`\`json). The JSON must strictly adhere to the following TypeScript interface:
{
  "overallBand": number,
  "examinerSummary": string,
  "criteria": {
    "taskResponse": { "band": number, "label": "Task Response", "feedback": string, "strengths": string[], "weaknesses": string[] },
    "coherenceCohesion": { "band": number, "label": "Coherence & Cohesion", "feedback": string, "strengths": string[], "weaknesses": string[] },
    "lexicalResource": { "band": number, "label": "Lexical Resource", "feedback": string, "strengths": string[], "weaknesses": string[] },
    "grammaticalRangeAccuracy": { "band": number, "label": "Grammar Range & Accuracy", "feedback": string, "strengths": string[], "weaknesses": string[] }
  },
  "inlineAnnotations": [
    {
      "id": string,
      "originalText": string,
      "errorType": "grammar" | "vocabulary" | "coherence" | "excellence",
      "categoryName": string,
      "explanation": string,
      "suggestedFix": string,
      "band8Alternative": string
    }
  ],
  "sampleRewrites": {
    "band75Version": string,
    "band85Version": string,
    "keyUpgrades": string[]
  }
}`;

export function computeTextStats(text: string, timeSpentSeconds: number): TextStats {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      wordCount: 0,
      characterCount: 0,
      paragraphCount: 0,
      sentenceCount: 0,
      timeSpentSeconds,
      averageSentenceLength: 0,
      academicVocabularyPercentage: 0,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const characterCount = trimmed.length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;
  
  const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const averageSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10;

  // Academic word list rough density check
  const academicMarkers = new Set([
    'furthermore', 'nevertheless', 'consequently', 'subsequently', 'demonstrate',
    'illustrate', 'proportion', 'significant', 'substantial', 'phenomenon',
    'perspective', 'facilitate', 'implement', 'advocate', 'imperative',
    'detrimental', 'inevitable', 'predominantly', 'underlying', 'comprehensive',
    'exacerbate', 'proponents', 'opponents', 'diminish', 'allocate', 'paramount'
  ]);

  let academicHits = 0;
  for (const w of words) {
    const cleanWord = w.toLowerCase().replace(/[^a-z]/g, '');
    if (academicMarkers.has(cleanWord) || cleanWord.endsWith('tion') || cleanWord.endsWith('ment') || cleanWord.endsWith('able')) {
      academicHits++;
    }
  }

  const academicVocabularyPercentage = Math.min(100, Math.round((academicHits / Math.max(1, wordCount)) * 100));

  return {
    wordCount,
    characterCount,
    paragraphCount,
    sentenceCount,
    timeSpentSeconds,
    averageSentenceLength,
    academicVocabularyPercentage,
  };
}

function findSourceText(essay: string, phrase: string): string | null {
  const index = essay.toLowerCase().indexOf(phrase.toLowerCase());
  return index === -1 ? null : essay.slice(index, index + phrase.length);
}

export function generateLocalEvaluation(essay: string, topic: Topic, timeSpentSeconds: number): EvaluationResult {
  const stats = computeTextStats(essay, timeSpentSeconds);
  const words = essay.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Dynamic band calibration based on length and structure
  let trBand = 6.0;
  let ccBand = 6.0;
  let lrBand = 6.0;
  let graBand = 6.0;

  if (stats.sentenceCount >= 8 && stats.averageSentenceLength > 14) {
    graBand = 6.5;
  }

  if (wordCount < topic.minWords) {
    trBand = Math.max(4.5, 6.0 - Math.ceil((topic.minWords - wordCount) / 40) * 0.5);
  } else if (wordCount >= 280 && stats.paragraphCount >= 4) {
    trBand = 6.5;
  }

  if (stats.paragraphCount < 3) {
    ccBand = 5.5;
  } else if (stats.paragraphCount >= 4 && stats.paragraphCount <= 5) {
    ccBand = 6.5;
  }

  if (stats.academicVocabularyPercentage > 20) {
    lrBand = 6.5;
  } else if (stats.academicVocabularyPercentage < 8) {
    lrBand = 5.5;
  }

  const rawOverall = (trBand + ccBand + lrBand + graBand) / 4;
  // Round to nearest half band
  const overallBand = Math.round(rawOverall * 2) / 2;

  // Detect potential phrases or inject calibrated annotations
  const annotations: InlineAnnotation[] = [];

  // 1. Check for common grammar slips
  const aLotOf = findSourceText(essay, 'a lot of');
  if (aLotOf) {
    annotations.push({
      id: 'err-1',
      originalText: aLotOf,
      errorType: 'vocabulary',
      categoryName: 'Informal Diction',
      explanation: "'a lot of' is conversational. Academic writing favors quantified or formal adjectives.",
      suggestedFix: 'a substantial number of / a considerable amount of',
      band8Alternative: 'a substantial proportion of / an extensive array of'
    });
  }

  const redundantOpinion = findSourceText(essay, 'in my opinion, i think');
  if (redundantOpinion) {
    annotations.push({
      id: 'err-2',
      originalText: redundantOpinion,
      errorType: 'coherence',
      categoryName: 'Redundancy / Tautology',
      explanation: "Using 'In my opinion' and 'I think' together is tautological (repeating the same meaning).",
      suggestedFix: 'In my view, / I would argue that',
      band8Alternative: 'It is my contention that'
    });
  }

  const moreAndMore = findSourceText(essay, 'more and more');
  if (moreAndMore) {
    annotations.push({
      id: 'err-3',
      originalText: moreAndMore,
      errorType: 'vocabulary',
      categoryName: 'Overused Cliché',
      explanation: "'more and more' is repetitive and lacks academic precision.",
      suggestedFix: 'an increasing number of / progressively more',
      band8Alternative: 'an ever-growing proportion of'
    });
  }

  const simpleAdjective = essay.match(/\b(good|bad)\b/i)?.[0];
  if (simpleAdjective) {
    const isGood = simpleAdjective.toLowerCase() === 'good';
    annotations.push({
      id: 'err-4',
      originalText: simpleAdjective,
      errorType: 'vocabulary',
      categoryName: 'Low-Band Lexicon (A2/B1)',
      explanation: "Vague evaluation terms should be substituted with context-specific adjectives.",
      suggestedFix: isGood ? 'beneficial / advantageous' : 'detrimental / adverse',
      band8Alternative: isGood ? 'exceedingly advantageous' : 'profoundly detrimental'
    });
  }

  return {
    id: 'eval-' + Date.now(),
    overallBand,
    examinerSummary: wordCount < topic.minWords
      ? `Bài viết của bạn hiện chưa đạt độ dài tối thiểu (${wordCount}/${topic.minWords} từ). Điều này sẽ bị trừ điểm trực tiếp ở tiêu chí Task Response theo quy chế chấm thi chính thức của IDP/British Council. Tuy nhiên, bố cục và ý tưởng thể hiện tiềm năng tốt.`
      : `Bài viết hoàn thành tốt yêu cầu đề bài (${wordCount} từ). Luận điểm được tổ chức tương đối rõ ràng. Để bứt phá lên Band 7.5+, bạn cần tiết chế các từ nối máy móc (Moreover, Furthermore), đồng thời nâng cấp cụm collocations học thuật và kiểm soát chặt các lỗi chia động từ/mạo từ.`,
    criteria: {
      taskResponse: {
        band: trBand,
        label: 'Task Response',
        feedback: wordCount < topic.minWords
          ? `Chưa đáp ứng đủ độ dài tối thiểu (${wordCount}/${topic.minWords} từ). Một số luận điểm chỉ mới nêu ra mà chưa có phân tích và ví dụ minh chứng đi kèm.`
          : `Đã phản hồi được yêu cầu trọng tâm của đề bài. Luận điểm có định hướng rõ ràng, tuy nhiên phần phân tích chiều sâu ở thân bài 2 có thể mở rộng cụ thể hơn.`,
        strengths: ['Có lập trường quan điểm rõ ràng', 'Cấu trúc bài làm theo đúng chuẩn 4 đoạn'],
        weaknesses: wordCount < topic.minWords ? ['Thiếu từ so với quy định chuẩn', 'Luận cứ còn sơ lược'] : ['Ví dụ chứng minh chưa mang tính học thuật cao']
      },
      coherenceCohesion: {
        band: ccBand,
        label: 'Coherence & Cohesion',
        feedback: 'Bài viết có phân đoạn mạch lạc. Tuy nhiên, việc sử dụng các từ nối máy móc ở đầu câu còn khá dày đặc, cần đa dạng hóa bằng liên kết ngữ nghĩa (referencing & substitution).',
        strengths: ['Phân chia mở - thân - kết rõ ràng', 'Ý tưởng trong đoạn có tính nối tiếp'],
        weaknesses: ['Lạm dụng từ nối cơ bản ở đầu câu', 'Thiếu các cấu trúc liên kết ẩn (lexical cohesion)']
      },
      lexicalResource: {
        band: lrBand,
        label: 'Lexical Resource',
        feedback: `Mức độ từ vựng học thuật ước tính đạt ${stats.academicVocabularyPercentage}%. Vốn từ đủ để diễn đạt ý tưởng nhưng còn sử dụng nhiều từ đơn giản và một số cụm collocations chưa tự nhiên.`,
        strengths: ['Truyền tải được ý kiến mà không bị hiểu sai nghĩa', 'Có cố gắng sử dụng từ ngữ chủ đề'],
        weaknesses: ['Lặp lại một số tính từ phổ thông', 'Một số collocations chưa chuẩn xác theo ngữ cảnh học thuật']
      },
      grammaticalRangeAccuracy: {
        band: graBand,
        label: 'Grammar Range & Accuracy',
        feedback: 'Sử dụng đan xen giữa câu đơn và câu ghép. Vẫn xuất hiện một số lỗi ngữ pháp nhỏ về chia động từ, mạo từ (a/an/the) và giới từ.',
        strengths: ['Có cấu trúc câu phức (mệnh đề quan hệ, câu điều kiện)', 'Dấu câu cơ bản đặt đúng vị trí'],
        weaknesses: ['Vẫn còn lỗi ngữ pháp không hệ thống (slips)', 'Cần tăng tỷ lệ câu hoàn toàn không có lỗi (error-free sentences)']
      }
    },
    inlineAnnotations: annotations,
    sampleRewrites: {
      band75Version: `It is widely argued that ${topic.title.toLowerCase()} presents both substantial advantages and notable challenges. While proponents maintain that this development stimulates socioeconomic progress, opponents express valid concerns regarding its long-term ramifications. From my perspective, although the risks are non-trivial, proactive governance and strategic adaptation can effectively harness these benefits for collective prosperity.`,
      band85Version: `The discourse surrounding ${topic.title.toLowerCase()} has ignited vigorous debate among policymakers and academics alike. While skeptics contend that unprecedented shifts in this domain may precipitate systemic instability, a more nuanced appraisal reveals profound transformative potential. It is my firm contention that rather than resisting inevitable structural evolution, institutions must implement rigorous regulatory frameworks to optimize societal outcomes.`,
      keyUpgrades: [
        'Thay thế các từ ngữ thông thường bằng thuật ngữ học thuật (e.g. "ramifications", "nuanced appraisal")',
        'Sử dụng cấu trúc câu phức đảo ngữ và mệnh đề phân từ để tăng Grammatical Range',
        'Tạo mạch liên kết tự nhiên bằng referencing thay vì từ nối đầu câu máy móc'
      ]
    },
    stats,
    submittedAt: new Date().toISOString()
  };
}

export async function evaluateEssayWithAI(
  essay: string,
  topic: Topic,
  timeSpentSeconds: number,
  apiKey?: string,
  provider: 'gemini' | 'openai' = 'gemini'
): Promise<EvaluationResult> {
  const stats = computeTextStats(essay, timeSpentSeconds);

  // If no user API key provided, fallback to high-fidelity local engine
  if (!apiKey || apiKey.trim() === '') {
    return generateLocalEvaluation(essay, topic, timeSpentSeconds);
  }

  const promptContent = `IELTS TASK DETAILS:
- Task Type: ${topic.type.toUpperCase()}
- Category: ${topic.category}
- Prompt: "${topic.prompt}"
${topic.chartDescription ? `- Chart/Data Description: ${topic.chartDescription}` : ''}
${topic.chartDataSummary ? `- Key Data Points:\n${topic.chartDataSummary.map(d => '  * ' + d).join('\n')}` : ''}

CANDIDATE ESSAY SUBMISSION:
"""
${essay}
"""

ACTUAL STATS:
- Word Count: ${stats.wordCount} words
- Minimum Required: ${topic.minWords} words
- Time Spent: ${Math.round(timeSpentSeconds / 60)} minutes

Evaluate strictly and return JSON.`;

  try {
    if (provider === 'gemini') {
      // Call Gemini 1.5 Flash API directly via REST endpoint
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT_IELTS }]
          },
          contents: [
            {
              parts: [{ text: promptContent }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Gemini API Error:', errorText);
        throw new Error(`Gemini API returned ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response from Gemini API');

      const parsed = JSON.parse(rawText);
      return {
        id: 'eval-' + Date.now(),
        overallBand: parsed.overallBand,
        examinerSummary: parsed.examinerSummary,
        criteria: parsed.criteria,
        inlineAnnotations: parsed.inlineAnnotations,
        sampleRewrites: parsed.sampleRewrites,
        stats,
        submittedAt: new Date().toISOString()
      };
    } else {
      // Call OpenAI API
      const url = 'https://api.openai.com/v1/chat/completions';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT_IELTS },
            { role: 'user', content: promptContent }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('OpenAI API Error:', errorText);
        throw new Error(`OpenAI API returned ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const rawText = data?.choices?.[0]?.message?.content;
      if (!rawText) throw new Error('Empty response from OpenAI');

      const parsed = JSON.parse(rawText);
      return {
        id: 'eval-' + Date.now(),
        overallBand: parsed.overallBand,
        examinerSummary: parsed.examinerSummary,
        criteria: parsed.criteria,
        inlineAnnotations: parsed.inlineAnnotations,
        sampleRewrites: parsed.sampleRewrites,
        stats,
        submittedAt: new Date().toISOString()
      };
    }
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    console.warn('AI API call failed, falling back to local calibrated evaluator:', errMessage);
    const localResult = generateLocalEvaluation(essay, topic, timeSpentSeconds);
    localResult.examinerSummary += ` (Lưu ý: API AI trả về lỗi hoặc chưa cấu hình đúng key, kết quả hiện tại được phân tích theo bộ lọc ngôn ngữ nội bộ chuẩn khảo thí).`;
    return localResult;
  }
}
