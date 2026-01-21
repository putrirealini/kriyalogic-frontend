import React, { useState } from 'react';
import { Search, Plus, Trash2, Pencil } from 'lucide-react';
import { User2 } from 'lucide-react';
import AddTourGuideModal from '../components/AddTourGuideModal';
import EditTourGuideModal from '../components/EditTourGuideModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import useGuides from '../hooks/useGuides';
import useDeleteGuide from '../hooks/useDeleteGuide';
import toast from 'react-hot-toast';

const TourGuides = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [guideToEdit, setGuideToEdit] = useState(null);
    const [guideToDelete, setGuideToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { guides, loading, error, refetch } = useGuides();
    const { deleteGuide } = useDeleteGuide();
    const [searchTerm, setSearchTerm] = useState('');

    const highlightText = (text) => {
        if (!searchTerm || !text) return text || '-';
        
        const parts = text.toString().split(new RegExp(`(${searchTerm})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) => 
                    part.toLowerCase() === searchTerm.toLowerCase() ? (
                        <span key={i} className="bg-yellow-200 font-bold">{part}</span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const handleEdit = (guide) => {
        setGuideToEdit(guide);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (id) => {
        setGuideToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!guideToDelete) return;

        setIsDeleting(true);
        const result = await deleteGuide(guideToDelete);
        setIsDeleting(false);

        if (result.success) {
            toast.success('Guide deleted successfully');
            refetch();
            setIsDeleteModalOpen(false);
            setGuideToDelete(null);
        } else {
            toast.error(result.error || 'Failed to delete guide');
        }
    };

    const filteredGuides = guides.filter(guide => 
        (guide.guideName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guide.agency || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div>
                <img src="/hero-image-tour-guides.png" alt="" className='w-full h-32 md:h-96 object-contain' />
            </div>
            <div className='mt-4 px-4 md:px-24 flex flex-col md:flex-row justify-between gap-4'>
                <div className='flex flex-col md:flex-row gap-4 w-full md:w-auto'>
                    <div className='bg-primary py-2 px-10 rounded-xl text-[#E7E5DB] font-bold flex items-center justify-center text-sm'>
                        Total {filteredGuides.length}
                    </div>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-primary w-full md:w-64 text-sm"
                        />
                    </div>
                </div>
                <div className='w-full md:w-auto'>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors w-full md:w-auto text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add Tour Guide
                    </button>
                </div>
            </div>

            {/* table */}
            <div className="overflow-x-auto px-4 md:px-24 mt-4 pb-20">
                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-600">Error: {error}</div>
                ) : (
                    <table className="w-full border-collapse">
                        <thead className="bg-[#EEF1F4] text-gray-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                    Guide Name
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                    Agency
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                    Contact
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                    Commission
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredGuides.length > 0 ? (
                                filteredGuides.map((item) => (
                                    <tr
                                        key={item._id || item.id}
                                        className="border-b last:border-b-0 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-sm flex flex-row gap-1"><User2 className="w-4 h-4" /> {highlightText(item.guideName)}</td>
                                        <td className="px-4 py-3 text-sm">{highlightText(item.agency)}</td>
                                        <td className="px-4 py-3 text-sm">{item.contact || '-'}</td>
                                        <td className="px-4 py-3 text-sm">{item.commissionRate ? `${item.commissionRate}%` : '-'}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
                                                ${item.status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {item.status === "active" ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    className="text-blue-600 hover:text-blue-800"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(item);
                                                    }}
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                {/* <button 
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(item._id || item.id);
                                                    }}
                                                >
                                                    <Trash2 size={18} />
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                        No tour guides found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Tour Guide Modal */}
            <AddTourGuideModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={refetch}
            />

            {/* Edit Tour Guide Modal */}
            <EditTourGuideModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={refetch}
                guide={guideToEdit}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setGuideToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Tour Guide"
                message="Are you sure you want to delete this tour guide? This action cannot be undone."
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default TourGuides;
