import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const useStoreSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const { token, logout } = useAuth();

    const fetchStoreSettings = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/store-settings`, {
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

                throw new Error(data.message || 'Failed to fetch store settings');
            }

            setSettings(data.data || null);
        } catch (err) {
            setError(err.message || 'Something went wrong');
            setSettings(null);
        } finally {
            setLoading(false);
        }
    }, [token, logout]);

    const updateStoreSettings = async (payload) => {
        if (!token) {
            return {
                success: false,
                error: 'Unauthorized. Token not found.',
            };
        }

        setSaving(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/store-settings`, {
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

                throw new Error(data.message || 'Failed to update store settings');
            }

            setSettings(data.data || payload);

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
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchStoreSettings();
    }, [fetchStoreSettings]);

    return {
        settings,
        loading,
        saving,
        error,
        setError,
        refetch: fetchStoreSettings,
        updateStoreSettings,
    };
};

export default useStoreSettings;