import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const useParentProducts = () => {
    const [parentProducts, setParentProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, logout } = useAuth();

    const fetchParentProducts = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/v1/master-products', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(data.message || 'Failed to fetch parent products');
            }

            setParentProducts(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token, logout]);

    useEffect(() => {
        fetchParentProducts();
    }, [fetchParentProducts]);

    return { parentProducts, loading, error, refetch: fetchParentProducts };
};

export default useParentProducts;
