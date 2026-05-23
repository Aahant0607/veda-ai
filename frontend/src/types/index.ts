export interface AssignmentFormData {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type JobStatus  = 'pending' | 'processing' | 'completed' | 'failed';

export interface Question {
  id: string;
  text: string;
  type: string;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
}

export interface Section {
  name:        string;
  title:       string;
  instruction: string;
  questions:   Question[];
  totalMarks:  number;
}

export interface GeneratedPaper {
  _id:          string;
  assignmentId: string;
  examTitle:    string;
  subject:      string;
  grade:        string;
  dueDate:      string;
  totalMarks:   number;
  duration:     string;
  sections:     Section[];
}

export interface WSMessage {
  type:     'CONNECTED' | 'STATUS_UPDATE' | 'COMPLETED' | 'FAILED';
  status?:  JobStatus;
  progress?: number;
  paperId?: string;
  error?:   string;
}