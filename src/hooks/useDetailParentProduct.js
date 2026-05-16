import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const useDetailParentProduct = (customId = null) => {
    const [parentProduct, setParentProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { token, logout } = useAuth();
    const params = useParams();

    const resolvedId = customId ?? params.id ?? null;

    const fetchParentProductDetail = useCallback(
        async (signal) => {
            if (!token || !resolvedId) {
                setParentProduct(null);
                setError(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `${API_BASE_URL}/master-products/${resolvedId}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        signal,
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        logout();
                        throw new Error('Session expired. Please login again.');
                    }

                    throw new Error(data.message || 'Failed to fetch parent product detail');
                }

                if (signal?.aborted) return;

                const normalizedParentProduct = data?.data || null;

                setParentProduct(normalizedParentProduct);
                setError(null);
            } catch (err) {
                if (err.name === 'AbortError') return;

                setError(err.message || 'Something went wrong');
                setParentProduct(null);
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [token, resolvedId, logout]
    );

    useEffect(() => {
        const controller = new AbortController();

        fetchParentProductDetail(controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchParentProductDetail]);

    return {
        parentProduct,
        parentProductDetail: parentProduct,
        loading,
        error,
        refetch: () => fetchParentProductDetail(),
    };
};

export default useDetailParentProduct;