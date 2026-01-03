import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useDeleteCashier = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const deleteCashier = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5000/api/v1/users/cashier/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete cashier');
            }

            return { success: true, message: data.message };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return { deleteCashier, loading, error };
};

export default useDeleteCashier;
