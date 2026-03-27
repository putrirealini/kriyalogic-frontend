import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const useDetailParentProduct = (customId = null) => {
    const [parentProduct, setParentProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { token, logout } = useAuth();
    const params = useParams();

    const id = customId || params.id;

    const fetchParentProductDetail = useCallback(async () => {
        if (!token || !id) {
            setParentProduct(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5000/api/v1/master-products/${id}`, {
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

                throw new Error(data.message || 'Failed to fetch parent product detail');
            }

            setParentProduct(data.data || null);
        } catch (err) {
            setError(err.message || 'Something went wrong');
            setParentProduct(null);
        } finally {
            setLoading(false);
        }
    }, [token, id, logout]);

    useEffect(() => {
        fetchParentProductDetail();
    }, [fetchParentProductDetail]);

    return {
        parentProduct,
        loading,
        error,
        refetch: fetchParentProductDetail
    };
};

export default useDetailParentProduct;