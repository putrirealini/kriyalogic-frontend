import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const useUpdateChildProduct = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token, logout } = useAuth();

    const updateChildProduct = async (id, payload) => {
        setLoading(true);
        setError(null);

        try {
            if (!token) {
                throw new Error('Unauthorized. Token not found.');
            }

            if (!id) {
                throw new Error('Child product id is required.');
            }

            const response = await fetch(`${API_BASE_URL}/child-items/${id}`, {
                method: 'PUT',
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

                throw new Error(data.message || 'Failed to update child product');
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
        updateChildProduct,
        loading,
        error,
        setError,
    };
};

export default useUpdateChildProduct;