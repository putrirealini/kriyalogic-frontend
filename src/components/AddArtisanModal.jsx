import React, { useState } from 'react';
import useCreateArtisan from '../hooks/useCreateArtisan';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AddArtisanModal = ({ isOpen, onClose, onSuccess }) => {
    const { createArtisan, loading, error } = useCreateArtisan();
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        commissionRate: '',
        bankAccount: '',
        address: ''
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
        
        // Convert commissionRate to number if needed, though API might handle string
        const payload = {
            ...formData,
            commissionRate: Number(formData.commissionRate)
        };

        const result = await createArtisan(payload);

        if (result.success) {
            toast.success('Artisan created successfully');
            // Reset form
            setFormData({
                fullName: '',
                phoneNumber: '',
                commissionRate: '',
                bankAccount: '',
                address: ''
            });
            if (onSuccess) onSuccess();
            onClose();
        } else {
            toast.error(result.error || 'Failed to create artisan');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 relative border-2 border-[#3d2a20]">
                {/* Header */}
                <h2 className="text-2xl font-bold text-[#3d2a20] mb-6">
                    Register New Artisan
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-900">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Phone Number */}
                        <div className="space-y-1.5 w-full">
                            <label className="text-sm font-semibold text-gray-900">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                required
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>

                        {/* Commissions Rate */}
                        <div className="space-y-1.5 w-full">
                            <label className="text-sm font-semibold text-gray-900">
                                Commissions Rate (%)
                            </label>
                            <input
                                type="number"
                                name="commissionRate"
                                value={formData.commissionRate}
                                onChange={handleChange}
                                placeholder="15"
                                required
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                    </div>

                    {/* Bank Account */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-900">
                            Bank Account
                        </label>
                        <input
                            type="text"
                            name="bankAccount"
                            value={formData.bankAccount}
                            onChange={handleChange}
                            placeholder="BCA - 12345678"
                            required
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-900">
                            Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your address"
                            required
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 bg-[#4A3728] text-white py-2.5 rounded-xl font-bold hover:bg-[#3d2a20] transition-colors text-sm disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#4A3728] text-white py-2.5 rounded-xl font-bold hover:bg-[#3d2a20] transition-colors text-sm disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddArtisanModal;
