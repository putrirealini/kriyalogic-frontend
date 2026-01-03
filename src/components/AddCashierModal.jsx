import React, { useState } from 'react';
import useCreateCashier from '../hooks/useCreateCashier';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const AddCashierModal = ({ isOpen, onClose, onSuccess }) => {
    const { createCashier, loading, error } = useCreateCashier();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const result = await createCashier(formData);

        if (result.success) {
            toast.success('Cashier created successfully!');
            // Reset form
            setFormData({
                username: '',
                email: '',
                password: ''
            });
            if (onSuccess) onSuccess();
            onClose();
        } else {
            toast.error(result.error || 'Failed to create cashier');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 relative border-2 border-[#3d2a20]">
                {/* Header */}
                <h2 className="text-2xl font-bold text-[#3d2a20] mb-6 text-center">
                    Register New Cashier
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-900">
                            Name
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter name"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-900">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-900">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="**********"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 bg-[#3d2a20] text-white py-2 rounded-xl font-bold hover:bg-[#2a1d16] transition-colors text-sm disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#3d2a20] text-white py-2 rounded-xl font-bold hover:bg-[#2a1d16] transition-colors text-sm disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCashierModal;
