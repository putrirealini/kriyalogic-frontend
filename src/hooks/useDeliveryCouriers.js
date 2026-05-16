import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const useDeliveryCouriers = () => {
    const [couriers, setCouriers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { token, logout } = useAuth();

    const fetchCouriers = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/deliveries/get-couriers`, {
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

                throw new Error(data.message || 'Failed to fetch couriers');
            }

            setCouriers(data.data || []);
        } catch (err) {
            setError(err.message || 'Something went wrong');
            setCouriers([]);
        } finally {
            setLoading(false);
        }
    }, [token, logout]);

    useEffect(() => {
        fetchCouriers();
    }, [fetchCouriers]);

    return {
        couriers,
        setCouriers,
        loading,
        error,
        refetch: fetchCouriers
    };
};

export default useDeliveryCouriers;
