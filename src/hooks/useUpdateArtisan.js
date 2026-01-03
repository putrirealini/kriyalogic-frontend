import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useUpdateArtisan = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const updateArtisan = async (id, formData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5000/api/v1/artisans/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update artisan');
            }

            return { success: true, data: data.data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return { updateArtisan, loading, error };
};

export default useUpdateArtisan;
