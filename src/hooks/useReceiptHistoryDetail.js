import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useReceiptHistoryDetail = (id) => {
    const [receiptDetail, setReceiptDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, logout } = useAuth();

    const fetchReceiptDetail = useCallback(async () => {
        if (!id || !token) {
            setReceiptDetail(null);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch(`http://localhost:5000/api/v1/pos/receipt-histories/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to fetch receipt detail');
            }

            setReceiptDetail(result.data || null);
        } catch (err) {
            setError(err.message || 'Failed to fetch receipt detail');
            setReceiptDetail(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchReceiptDetail();
    }, [fetchReceiptDetail]);

    return {
        receiptDetail,
        loading,
        error,
        refetch: fetchReceiptDetail
    };
};

export default useReceiptHistoryDetail;