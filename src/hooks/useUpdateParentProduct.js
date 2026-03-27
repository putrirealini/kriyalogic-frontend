import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const useUpdateParentProduct = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const updateParentProduct = async (id, payload) => {
        setLoading(true);
        setError(null);

        try {
            if (!token) {
                throw new Error('Unauthorized. Token not found.');
            }

            const response = await fetch(`${API_BASE_URL}/master-products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update parent product');
            }

            return {
                success: true,
                data
            };
        } catch (err) {
            const message = err.message || 'Something went wrong';
            setError(message);

            return {
                success: false,
                error: message
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        updateParentProduct,
        loading,
        error,
        setError
    };
};

export default useUpdateParentProduct;