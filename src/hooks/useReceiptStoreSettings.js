import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const useReceiptStoreSettings = () => {
    const [receiptSettings, setReceiptSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, logout } = useAuth();

    const fetchReceiptSettings = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            setError('');

            const response = await fetch(`${API_BASE_URL}/store-settings/receipt-detail`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                if (response.status === 401) {
                    logout();
                    throw new Error('Session expired. Please login again.');
                }

                throw new Error(result.message || 'Failed to fetch receipt settings');
            }

            setReceiptSettings(result.data || null);
        } catch (err) {
            setError(err.message || 'Failed to fetch receipt settings');
            setReceiptSettings(null);
        } finally {
            setLoading(false);
        }
    }, [token, logout]);

    useEffect(() => {
        fetchReceiptSettings();
    }, [fetchReceiptSettings]);

    return {
        receiptSettings,
        loading,
        error,
        refetch: fetchReceiptSettings
    };
};

export default useReceiptStoreSettings;
