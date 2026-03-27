import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const useDetailChildProduct = () => {
    const [childProduct, setChildProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { token, logout } = useAuth();
    const { childId } = useParams();

    const fetchChildProduct = useCallback(async () => {
        if (!token || !childId) {
            setChildProduct(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/child-items/${childId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    throw new Error('Session expired. Please login again.');
                }

                throw new Error(data.message || 'Failed to fetch child product detail');
            }

            const item = data?.data?.items?.[0] || null;
            setChildProduct(item);
        } catch (err) {
            setError(err.message || 'Something went wrong');
            setChildProduct(null);
        } finally {
            setLoading(false);
        }
    }, [token, childId, logout]);

    useEffect(() => {
        fetchChildProduct();
    }, [fetchChildProduct]);

    return {
        childProduct,
        loading,
        error,
        refetch: fetchChildProduct,
    };
};

export default useDetailChildProduct;