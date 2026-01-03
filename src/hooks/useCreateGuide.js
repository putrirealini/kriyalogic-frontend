import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useCreateGuide = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const createGuide = async (formData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/v1/guides', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create guide');
            }

            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return { createGuide, loading, error };
};

export default useCreateGuide;
