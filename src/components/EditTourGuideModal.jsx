import React, { useState, useEffect } from 'react';
import useUpdateGuide from '../hooks/useUpdateGuide';
import toast from 'react-hot-toast';

const EditTourGuideModal = ({ isOpen, onClose, onSuccess, guide }) => {
    const { updateGuide, loading, error } = useUpdateGuide();
    const [formData, setFormData] = useState({
        guideName: '',
        agency: '',
        commissionRate: '',
        contact: '',
        status: 'active'
    });

    useEffect(() => {
        if (guide) {
            setFormData({
                guideName: guide.guideName || '',
                agency: guide.agency || '',
                commissionRate: guide.commissionRate || '',
                contact: guide.contact || '',
                status: guide.status || 'active'
            });
        }
    }, [guide]);

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
        
        const payload = {
            ...formData,
            commissionRate: Number(formData.commissionRate)
        };

        const result = await updateGuide(guide.id || guide._id, payload);
        
        if (result.success) {
            toast.success('Tour Guide updated successfully');
            if (onSuccess) onSuccess();
            onClose();
        } else {
            toast.error(result.error || 'Failed to update tour guide');
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 relative border-2 border-[#3d2a20]">
                {/* Header */}
                <h2 className="text-2xl font-bold text-[#3d2a20] mb-6">
                    Edit Tour Guide
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Guide Name */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-900">
                            Guide Name
                        </label>
                        <input
                            type="text"
                            name="guideName"
                            value={formData.guideName}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                            required
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Agency */}
                        <div className="space-y-1 w-full">
                            <label className="text-sm font-semibold text-gray-900">
                                Agency
                            </label>
                            <input
                                type="text"
                                name="agency"
                                value={formData.agency}
                                onChange={handleChange}
                                placeholder="Enter agency name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                                required
                            />
                        </div>

                        {/* Commissions Rate */}
                        <div className="space-y-1 w-full">
                            <label className="text-sm font-semibold text-gray-900">
                                Commissions Rate
                            </label>
                            <input
                                type="number"
                                name="commissionRate"
                                value={formData.commissionRate}
                                onChange={handleChange}
                                placeholder="15"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-900">
                            Contact
                        </label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            placeholder="0812345678"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                            required
                        />
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

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-[#3d2a20] text-white py-2 rounded-xl font-bold hover:bg-[#2a1d16] transition-colors text-sm"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-[#3d2a20] text-white py-2 rounded-xl font-bold hover:bg-[#2a1d16] transition-colors text-sm disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTourGuideModal;
