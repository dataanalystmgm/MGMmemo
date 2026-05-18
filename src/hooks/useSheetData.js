import { useState, useCallback } from 'react';
import { api } from '../utils/api';

export const useSheetData = () => {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchMemos();
      setMemos(data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { memos, loading, refreshData };
};