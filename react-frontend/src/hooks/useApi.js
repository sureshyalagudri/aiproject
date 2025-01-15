import { useState } from 'react';

const useApi = (apiCall) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall(...args);
      setLoading(false);
      return response;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Something went wrong');
      throw err;
    }
  };

  return { callApi, loading, error };
};

export default useApi;