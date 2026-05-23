import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  id: string;
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
}

export interface ISection {
  name: string;
  title: string;
  instruction: string;
  questions: IQuestion[];
  totalMarks: number;
}

export interface IGeneratedPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  examTitle: string;
  subject: string;
  grade: string;
  dueDate: Date;
  totalMarks: number;
  duration: string;
  sections: ISection[];
}

const QuestionSchema = new Schema<IQuestion>({
  id:         { type: String, required: true },
  text:       { type: String, required: true },
  type:       { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  marks:      { type: Number, required: true },
  options:    [{ type: String }],
});

const SectionSchema = new Schema<ISection>({
  name:        { type: String, required: true },
  title:       { type: String, required: true },
  instruction: { type: String, required: true },
  questions:   [QuestionSchema],
  totalMarks:  { type: Number, required: true },
});

const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    examTitle:    { type: String, required: true },
    subject:      { type: String, required: true },
    grade:        { type: String, required: true },
    dueDate:      { type: Date,   required: true },
    totalMarks:   { type: Number, required: true },
    duration:     { type: String, required: true },
    sections:     [SectionSchema],
  },
  { timestamps: true }
);

export const GeneratedPaper = mongoose.model<IGeneratedPaper>('GeneratedPaper', GeneratedPaperSchema);