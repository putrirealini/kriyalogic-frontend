import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useCheckout = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, logout } = useAuth();

    const checkout = async (payload) => {
        if (!token) return;

        try {
            setLoading(true);
            setError('');

            const response = await fetch('http://localhost:5000/api/v1/pos/checkout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const contentType = response.headers.get('content-type') || '';
            const rawText = await response.text();

            let result = null;

            if (rawText && contentType.includes('application/json')) {
                try {
                    result = JSON.parse(rawText);
                } catch (parseError) {
                    throw new Error('Invalid JSON response from server');
                }
            }

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                        rawText ||
                        `Failed to process payment (HTTP ${response.status})`
                );
            }

            if (!result?.success) {
                throw new Error(result?.message || 'Failed to process payment');
            }

            return {
                success: true,
                data: result.data,
                message: result.message || 'Payment successful'
            };
        } catch (err) {
            const message = err.message || 'Failed to process payment';
            setError(message);

            return {
                success: false,
                error: message,
                data: null
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        checkout,
        loading,
        error,
        setError
    };
};

export default useCheckout;