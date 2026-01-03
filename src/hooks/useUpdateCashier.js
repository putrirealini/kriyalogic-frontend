import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useUpdateCashier = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const updateCashier = async (id, formData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5000/api/v1/users/cashier/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update cashier');
            }

            return { success: true, data: data.data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return { updateCashier, loading, error };
};

export default useUpdateCashier;
