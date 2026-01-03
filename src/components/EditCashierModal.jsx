import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import useUpdateCashier from '../hooks/useUpdateCashier';
import toast from 'react-hot-toast';

const EditCashierModal = ({ isOpen, onClose, onSuccess, cashier }) => {
    const { updateCashier, loading, error } = useUpdateCashier();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        status: 'active'
    });

    useEffect(() => {
        if (cashier) {
            setFormData({
                username: cashier.username || cashier.name || '',
                email: cashier.email || '',
                password: '', // Password not pre-filled
                status: cashier.status || 'active'
            });
        }
    }, [cashier]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Remove empty password if not changed
        const dataToSend = { ...formData };
        if (!dataToSend.password) {
            delete dataToSend.password;
        }

        const result = await updateCashier(cashier.id || cashier._id, dataToSend);
        
        if (result.success) {
            toast.success('Cashier updated successfully!');
            if (onSuccess) onSuccess();
            onClose();
        } else {
            toast.error(result.error || 'Failed to update cashier');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 relative">
                <button 
                    onClick={onClose}
                    className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold mb-6">Edit Cashier</h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-900">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter username"
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
                            placeholder="Enter email address"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                        />
                    </div>

                    {/* Password (Optional) */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-900">
                            New Password <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter new password"
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

                    {/* Status */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-900">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm bg-white"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2.5 rounded-xl font-bold mt-6 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            'Saving...'
                        ) : (
                            <>
                                <Save size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditCashierModal;
