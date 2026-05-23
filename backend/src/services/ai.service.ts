import { GoogleGenerativeAI } from '@google/generative-ai';
import { ISection } from '../models/GeneratedPaper';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export interface AssignmentInput {
  title: string;
  subject: string;
  grade: string;
  questionTypes: string[];          // e.g. ['MCQ', 'Short Answer', 'Numerical']
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileContent?: string;
  // ── New: per-type breakdown passed from the form ──
  questionBreakdown?: {
    type: string;
    questions: number;
    marksEach: number;
  }[];
}

export const generateQuestionPaper = async (input: AssignmentInput) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      maxOutputTokens: 6000,
    },
  });

  // ── Build the per-section breakdown string for the prompt ──────
  const breakdown = input.questionBreakdown && input.questionBreakdown.length > 0
    ? input.questionBreakdown
    : input.questionTypes.map((type) => ({
        type,
        questions: Math.floor(input.totalQuestions / input.questionTypes.length),
        marksEach: Math.floor(input.totalMarks / input.totalQuestions) || 1,
      }));

  const breakdownText = breakdown
    .map((b, i) =>
      `Section ${String.fromCharCode(65 + i)}: ${b.type} — ${b.questions} questions × ${b.marksEach} mark(s) each = ${b.questions * b.marksEach} marks`
    )
    .join('\n');

  const sectionSchemas = breakdown
    .map((b, i) => {
      const sectionLetter = String.fromCharCode(65 + i);
      const isMAQ = b.type === 'MCQ' || b.type === 'True/False';
      return `{
      "name": "Section ${sectionLetter}",
      "title": "${b.type}",
      "instruction": "Attempt all questions. Each question carries ${b.marksEach} mark(s).",
      "totalMarks": ${b.questions * b.marksEach},
      "questions": [
        {
          "id": "${sectionLetter}1",
          "text": "Question text here?",
          "type": "${b.type}",
          "difficulty": "easy|medium|hard",
          "marks": ${b.marksEach}
          ${isMAQ ? ',"options": ["Option A", "Option B", "Option C", "Option D"]' : ''}
        }
        // ... ${b.questions} questions total in this section
      ]
    }`;
    })
    .join(',\n');

  const contextBlock = input.fileContent
    ? `\nBase your questions on this reference material:\n"""\n${input.fileContent.slice(0, 3000)}\n"""`
    : '';

  const prompt = `You are a professional Indian school exam paper generator.

Generate a complete question paper with EXACTLY these specifications:

PAPER DETAILS:
- Title: ${input.title}
- Subject: ${input.subject}
- Grade/Class: ${input.grade}
- Total Questions: ${input.totalQuestions}
- Total Marks: ${input.totalMarks}
- Special Instructions: ${input.additionalInstructions || 'None'}
${contextBlock}

SECTION-WISE BREAKDOWN (follow this EXACTLY — do not change question counts or marks):
${breakdownText}

DIFFICULTY DISTRIBUTION per section:
- 40% questions should be difficulty: "easy"
- 40% questions should be difficulty: "medium"  
- 20% questions should be difficulty: "hard"

STRICT RULES:
1. Create exactly ${breakdown.length} sections as specified above
2. Each section must have EXACTLY the number of questions specified
3. Marks per question must be EXACTLY as specified — do not change them
4. MCQ and True/False must have exactly 4 options each
5. Questions must be appropriate for Grade ${input.grade} ${input.subject}
6. difficulty must be exactly one of: "easy", "medium", "hard"
7. Total marks across all sections must equal exactly ${input.totalMarks}
8. Return ONLY valid JSON — no markdown, no explanation

Return this exact JSON structure:
{
  "examTitle": "${input.title}",
  "duration": "${estimateDuration(input.totalMarks)}",
  "sections": [
    ${sectionSchemas}
  ]
}`;

  const result = await model.generateContent(prompt);
  const text   = result.response.text();
  const clean  = text.replace(/```json|```/g, '').trim();

  let parsed: any;
  try {
    parsed = JSON.parse(clean);
  } catch {
    // Sometimes Gemini adds a trailing comma — try to fix it
    const fixed = clean.replace(/,\s*([}\]])/g, '$1');
    parsed = JSON.parse(fixed);
  }

  return validateAndStructure(parsed, input, breakdown);
};

// ── Estimate exam duration based on total marks ──────────────────────
function estimateDuration(totalMarks: number): string {
  if (totalMarks <= 20)  return '45 Minutes';
  if (totalMarks <= 40)  return '1 Hour';
  if (totalMarks <= 60)  return '2 Hours';
  if (totalMarks <= 80)  return '2.5 Hours';
  return '3 Hours';
}

// ── Validate and normalise the AI response ───────────────────────────
function validateAndStructure(
  parsed: any,
  input: AssignmentInput,
  breakdown: { type: string; questions: number; marksEach: number }[]
) {
  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error('AI response missing sections array');
  }

  const sections: ISection[] = parsed.sections.map((sec: any, idx: number) => {
    const expected = breakdown[idx];
    return {
      name:        sec.name        || `Section ${String.fromCharCode(65 + idx)}`,
      title:       sec.title       || expected?.type || 'Questions',
      instruction: sec.instruction || `Attempt all questions. Each question carries ${expected?.marksEach || 1} mark(s).`,
      totalMarks:  sec.totalMarks  || (expected ? expected.questions * expected.marksEach : 0),
      questions: (sec.questions || []).map((q: any, qi: number) => ({
        id:         q.id         || `${String.fromCharCode(65 + idx)}${qi + 1}`,
        text:       q.text       || '',
        type:       q.type       || expected?.type || input.questionTypes[0],
        difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
        marks:      q.marks      || expected?.marksEach || 1,
        options:    q.options,
      })),
    };
  });

  return {
    examTitle: parsed.examTitle || input.title,
    duration:  parsed.duration  || estimateDuration(input.totalMarks),
    sections,
  };
}
