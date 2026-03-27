import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useMarkAllArtisanCommissionPaid = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, logout } = useAuth();

    const markAllPaid = async (id) => {
        if (!token) return;

        try {
            setLoading(true);
            setError('');

            const response = await fetch(`http://localhost:5000/api/v1/artisans/${id}/mark-all-paid`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            const contentType = response.headers.get('content-type') || '';
            const rawText = await response.text();

            let result = null;

            if (rawText && contentType.includes('application/json')) {
                result = JSON.parse(rawText);
            }

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                        rawText ||
                        `Failed to mark commissions as paid (HTTP ${response.status})`
                );
            }

            if (!result?.success) {
                throw new Error(result?.message || 'Failed to mark commissions as paid');
            }

            return {
                success: true,
                message: result.message || 'All commissions marked as paid',
                data: result.data || null
            };
        } catch (err) {
            const message = err.message || 'Failed to mark commissions as paid';
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
        markAllPaid,
        loading,
        error,
        setError
    };
};

export default useMarkAllArtisanCommissionPaid;