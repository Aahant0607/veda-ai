import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useStore } from '@/store';
import { WSMessage } from '@/types';

export const useWebSocket = (assignmentId: string | null) => {
  const ws      = useRef<WebSocket | null>(null);
  const router  = useRouter();
  const { setJobStatus, setGeneratedPaper } = useStore();

  const fetchPaper = useCallback(async (id: string) => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/assignments/${id}/paper`);
    setGeneratedPaper(res.data.paper);
    router.push(`/output/${id}`);
  }, [router, setGeneratedPaper]);

  useEffect(() => {
    if (!assignmentId) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
    ws.current  = new WebSocket(`${wsUrl}/ws?assignmentId=${assignmentId}`);

    ws.current.onmessage = (event) => {
      const msg: WSMessage = JSON.parse(event.data);
      if (msg.type === 'STATUS_UPDATE') setJobStatus(msg.status!, msg.progress);
      if (msg.type === 'COMPLETED')     { setJobStatus('completed', 100); fetchPaper(assignmentId); }
      if (msg.type === 'FAILED')        setJobStatus('failed', 0);
    };

    return () => ws.current?.close();
  }, [assignmentId, setJobStatus, fetchPaper]);
};