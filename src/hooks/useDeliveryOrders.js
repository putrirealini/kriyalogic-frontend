import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const useDeliveryOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { token, logout } = useAuth();

    const fetchDeliveryOrders = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/deliveries/data`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
console.log('Fetched delivery orders:', data);
            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    throw new Error('Session expired. Please login again.');
                }

                throw new Error(data.message || 'Failed to fetch delivery orders');
            }

            setOrders(data.data || []);
        } catch (err) {
            setError(err.message || 'Something went wrong');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [token, logout]);

    useEffect(() => {
        fetchDeliveryOrders();
    }, [fetchDeliveryOrders]);

    return {
        orders,
        loading,
        error,
        refetch: fetchDeliveryOrders,
        setOrders
    };
};

export default useDeliveryOrders;