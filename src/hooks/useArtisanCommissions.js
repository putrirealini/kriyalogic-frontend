import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useArtisanCommissions = ({
    id,
    search = '',
    status = 'unpaid',
    fromDate = '',
    toDate = ''
}) => {
    const [commissions, setCommissions] = useState([]);
    const [totalPending, setTotalPending] = useState(0);
    const [artisanName, setArtisanName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, logout } = useAuth();

    const fetchArtisanCommissions = useCallback(async () => {
        if (!id || !token) {
            setCommissions([]);
            setTotalPending(0);
            setArtisanName('');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams();

            if (search?.trim()) {
                params.append('search', search.trim());
            }

            if (status && status !== 'all') {
                params.append('status', status);
            }

            if (fromDate) {
                params.append('fromDate', fromDate);
            }

            if (toDate) {
                params.append('toDate', toDate);
            }

            const response = await fetch(`http://localhost:5000/api/v1/artisans/${id}/commissions?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
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
                        `Failed to fetch artisan commissions (HTTP ${response.status})`
                );
            }

            if (!result?.success) {
                throw new Error(result?.message || 'Failed to fetch artisan commissions');
            }

            setCommissions(Array.isArray(result.data) ? result.data : []);
            setTotalPending(Number(result.totalPending || 0));
            setArtisanName(result.artisanName || '');
        } catch (err) {
            setError(err.message || 'Failed to fetch artisan commissions');
            setCommissions([]);
            setTotalPending(0);
            setArtisanName('');
        } finally {
            setLoading(false);
        }
    }, [id, search, status, fromDate, toDate]);

    useEffect(() => {
        fetchArtisanCommissions();
    }, [fetchArtisanCommissions]);

    return {
        commissions,
        totalPending,
        id,
        artisanName,
        loading,
        error,
        refetch: fetchArtisanCommissions,
        setError
    };
};

export default useArtisanCommissions;