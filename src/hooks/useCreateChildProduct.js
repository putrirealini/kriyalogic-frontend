import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const useCreateChildProduct = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, logout } = useAuth();

    const createChildProduct = async (parentId, payload) => {
        setLoading(true);
        setError(null);

        try {
            if (!token) {
                throw new Error('Unauthorized. Token not found.');
            }

            if (!parentId) {
                throw new Error('Parent product id is required.');
            }

            const response = await fetch(`${API_BASE_URL}/master-products/${parentId}/child-items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    throw new Error('Session expired. Please login again.');
                }

                throw new Error(data.message || 'Failed to create child product');
            }

            return {
                success: true,
                data,
            };
        } catch (err) {
            const message = err.message || 'Something went wrong';
            setError(message);

            return {
                success: false,
                error: message,
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        createChildProduct,
        loading,
        error,
        setError,
    };
};

export default useCreateChildProduct;