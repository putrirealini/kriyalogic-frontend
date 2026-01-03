import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useCreateArtisan = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const createArtisan = async (formData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/v1/artisans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create artisan');
            }

            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return { createArtisan, loading, error };
};

export default useCreateArtisan;
