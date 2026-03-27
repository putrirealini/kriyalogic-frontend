import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useReceiptHistories = (params = {}) => {
    const [receiptHistories, setReceiptHistories] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, logout } = useAuth();

    const fetchReceiptHistories = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            setError('');

            const searchParams = new URLSearchParams();

            if (params.search) searchParams.append('search', params.search);
            if (params.page) searchParams.append('page', params.page);
            if (params.limit) searchParams.append('limit', params.limit);

            const response = await fetch(`http://localhost:5000/api/v1/pos/receipt-histories?${searchParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to fetch receipt histories');
            }

            setReceiptHistories(result.data || []);
            setPagination({
                total: result.total || 0,
                page: result.page || 1,
                pages: result.pages || 1
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch receipt histories');
            setReceiptHistories([]);
        } finally {
            setLoading(false);
        }
    }, [params.search, params.page, params.limit]);

    useEffect(() => {
        fetchReceiptHistories();
    }, [fetchReceiptHistories]);

    return {
        receiptHistories,
        pagination,
        loading,
        error,
        refetch: fetchReceiptHistories
    };
};

export default useReceiptHistories;