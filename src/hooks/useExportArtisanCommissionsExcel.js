import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const useExportArtisanCommissionsExcel = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, logout } = useAuth();

    const exportExcel = async ({
        id,
        search = '',
        status = 'all',
        fromDate = '',
        toDate = ''
    }) => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams();

            if (search?.trim()) params.append('search', search.trim());
            if (status && status !== 'all') params.append('status', status);
            if (fromDate) params.append('fromDate', fromDate);
            if (toDate) params.append('toDate', toDate);

            const response = await fetch(`http://localhost:5000/api/v1/artisans/${id}/commissions/export-excel?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const contentType = response.headers.get('content-type') || '';
                let message = 'Failed to export Excel';

                if (contentType.includes('application/json')) {
                    const result = await response.json();
                    message = result?.message || message;
                } else {
                    const text = await response.text();
                    if (text) message = text;
                }

                throw new Error(message);
            }

            const blob = await response.blob();

            const disposition = response.headers.get('content-disposition') || '';
            const fileNameMatch = disposition.match(/filename=([^;]+)/i);
            const fileName = fileNameMatch
                ? fileNameMatch[1].replace(/"/g, '')
                : 'artisan-commission.xlsx';

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (err) {
            const message = err.message || 'Failed to export Excel';
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
        exportExcel,
        loading,
        error,
        setError
    };
};

export default useExportArtisanCommissionsExcel;