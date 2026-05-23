import { GoogleGenerativeAI } from '@google/generative-ai';
import { ISection } from '../models/GeneratedPaper';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface AssignmentInput {
  title: string;
  subject: string;
  grade: string;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileContent?: string;
}

export const generateQuestionPaper = async (input: AssignmentInput) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',          // Free tier model
    generationConfig: {
      responseMimeType: 'application/json',  // Forces clean JSON output
      temperature: 0.7,
      maxOutputTokens: 4000,
    },
  });

  const typeList = input.questionTypes.join(', ');
  const contextBlock = input.fileContent
    ? `\nBase questions on this content:\n"""\n${input.fileContent.slice(0, 3000)}\n"""`
    : '';

  const prompt = `You are a professional exam paper generator for Indian schools.

Create a question paper with these exact specs:
- Title: ${input.title}
- Subject: ${input.subject}
- Grade/Class: ${input.grade}
- Total Questions: ${input.totalQuestions}
- Total Marks: ${input.totalMarks}
- Question Types to include: ${typeList}
- Special Instructions: ${input.additionalInstructions || 'None'}
${contextBlock}

Rules:
1. Group questions by type into sections (Section A = first type, Section B = second type, etc.)
2. MCQ must have exactly 4 options labeled A, B, C, D
3. Distribute difficulty: 40% easy, 40% medium, 20% hard
4. Marks per question must total exactly ${input.totalMarks}
5. Questions must suit Grade ${input.grade} level

Return ONLY this JSON, nothing else:
{
  "examTitle": "string",
  "duration": "3 Hours",
  "sections": [
    {
      "name": "Section A",
      "title": "Multiple Choice Questions",
      "instruction": "Attempt all questions. Each question carries 1 mark.",
      "totalMarks": 10,
      "questions": [
        {
          "id": "A1",
          "text": "Question text?",
          "type": "MCQ",
          "difficulty": "easy",
          "marks": 1,
          "options": ["Option A", "Option B", "Option C", "Option D"]
        }
      ]
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Strip any accidental markdown fences
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);

  return validateAndStructure(parsed, input);
};

function validateAndStructure(parsed: any, input: AssignmentInput) {
  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error('AI response missing sections');
  }

  const sections: ISection[] = parsed.sections.map((sec: any, idx: number) => ({
    name:        sec.name        || `Section ${String.fromCharCode(65 + idx)}`,
    title:       sec.title       || 'Questions',
    instruction: sec.instruction || 'Attempt all questions',
    totalMarks:  sec.totalMarks  || 0,
    questions: (sec.questions || []).map((q: any, qi: number) => ({
      id:         q.id         || `${String.fromCharCode(65 + idx)}${qi + 1}`,
      text:       q.text       || '',
      type:       q.type       || input.questionTypes[0],
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
      marks:      q.marks      || 1,
      options:    q.options,
    })),
  }));

  return {
    examTitle: parsed.examTitle || input.title,
    duration:  parsed.duration  || '3 Hours',
    sections,
  };
}