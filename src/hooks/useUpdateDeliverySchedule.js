import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const useUpdateDeliverySchedule = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { token, logout } = useAuth();

    const updateDeliverySchedule = async (id, payload) => {
        setLoading(true);
        setError(null);

        try {
            if (!token) {
                throw new Error('Unauthorized. Token not found.');
            }

            if (!id) {
                throw new Error('Delivery id is required.');
            }

            const response = await fetch(`${API_BASE_URL}/deliveries/${id}/schedule`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    throw new Error('Session expired. Please login again.');
                }

                throw new Error(data.message || 'Failed to update delivery schedule');
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
        updateDeliverySchedule,
        loading,
        error,
        setError
    };
};

export default useUpdateDeliverySchedule;