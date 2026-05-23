import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  dueDate: Date;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileContent?: string;
  fileName?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title:                  { type: String, required: true },
    subject:                { type: String, required: true },
    grade:                  { type: String, required: true },
    dueDate:                { type: Date,   required: true },
    questionTypes:          [{ type: String }],
    totalQuestions:         { type: Number, required: true, min: 1 },
    totalMarks:             { type: Number, required: true, min: 1 },
    additionalInstructions: { type: String },
    fileContent:            { type: String },
    fileName:               { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);