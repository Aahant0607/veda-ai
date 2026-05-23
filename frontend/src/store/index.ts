import { create } from 'zustand';
import { GeneratedPaper, JobStatus } from '@/types';

interface Store {
  currentAssignmentId: string | null;
  jobStatus:           JobStatus | null;
  progress:            number;
  generatedPaper:      GeneratedPaper | null;

  setAssignmentId:  (id: string) => void;
  setJobStatus:     (status: JobStatus, progress?: number) => void;
  setGeneratedPaper:(paper: GeneratedPaper) => void;
  reset:            () => void;
}

export const useStore = create<Store>((set) => ({
  currentAssignmentId: null,
  jobStatus:           null,
  progress:            0,
  generatedPaper:      null,

  setAssignmentId:   (id)              => set({ currentAssignmentId: id }),
  setJobStatus:      (status, progress = 0) => set({ jobStatus: status, progress }),
  setGeneratedPaper: (paper)           => set({ generatedPaper: paper }),
  reset:             ()                => set({ currentAssignmentId: null, jobStatus: null, progress: 0, generatedPaper: null }),
}));