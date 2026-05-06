import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const useDailyReport = (params = {}) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [closing, setClosing] = useState(false);
    const [error, setError] = useState(null);

    const { token, logout } = useAuth();

    const fetchReport = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const searchParams = new URLSearchParams();

            if (params.date) {
                searchParams.append('date', params.date);
            }

            const url = `${API_BASE_URL}/daily-reports${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    throw new Error('Session expired. Please login again.');
                }

                throw new Error(data.message || 'Failed to fetch daily report');
            }

            setReport(data.data || null);
        } catch (err) {
            setError(err.message || 'Something went wrong');
            setReport(null);
        } finally {
            setLoading(false);
        }
    }, [token, logout, params.date]);

    const closeRegister = useCallback(async ({ date, actualCash, cashierNotes }) => {
        if (!token) {
            return {
                success: false,
                error: 'Unauthorized. Token not found.'
            };
        }

        setClosing(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/daily-reports/close-register`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date,
                    actualCash,
                    cashierNotes
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    throw new Error('Session expired. Please login again.');
                }

                throw new Error(data.message || 'Failed to close register');
            }

            await fetchReport();

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
            setClosing(false);
        }
    }, [token, logout, fetchReport]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    return {
        report,
        loading,
        closing,
        error,
        refetch: fetchReport,
        closeRegister
    };
};

export default useDailyReport;