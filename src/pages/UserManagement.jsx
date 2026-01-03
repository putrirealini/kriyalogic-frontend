import React, { useState } from 'react';
import { Search, Plus, Trash2, Pencil } from 'lucide-react';
import { User2 } from 'lucide-react';
import AddCashierModal from '../components/AddCashierModal';
import EditCashierModal from '../components/EditCashierModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import useCashiers from '../hooks/useCashiers';
import useDeleteCashier from '../hooks/useDeleteCashier';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCashier, setSelectedCashier] = useState(null);
    const [cashierToDelete, setCashierToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { cashiers, loading, error, refetch } = useCashiers();
    const { deleteCashier } = useDeleteCashier();
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

    const handleDeleteClick = (id) => {
        setCashierToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!cashierToDelete) return;

        setIsDeleting(true);
        const result = await deleteCashier(cashierToDelete);
        setIsDeleting(false);

        if (result.success) {
            toast.success('Cashier deleted successfully');
            refetch();
            setIsDeleteModalOpen(false);
            setCashierToDelete(null);
        } else {
            toast.error(result.error || 'Failed to delete cashier');
        }
    };

    const handleEdit = (cashier) => {
        setSelectedCashier(cashier);
        setIsEditModalOpen(true);
    };

    const filteredCashiers = cashiers.filter(cashier =>
        (cashier.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cashier.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className='px-4 md:px-24'>
                <img src="/hero-image-user-management.png" alt="" className='w-full h-32 md:h-96 object-contain' />
            </div>
            <div className=' px-4 md:px-24 flex flex-col md:flex-row justify-between gap-4'>
                <div className='flex flex-col md:flex-row gap-4 w-full md:w-auto'>
                    <div className='bg-primary py-2 px-10 rounded-xl text-[#E7E5DB] font-bold flex items-center justify-center text-sm'>
                        Total {filteredCashiers.length}
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
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors w-full md:w-auto text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add Cashier
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
                                    Cashier
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                    Email
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
                            {filteredCashiers.length > 0 ? (
                                filteredCashiers.map((item) => (
                                    <tr
                                        key={item.id || item._id}
                                        className="border-b last:border-b-0 hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-sm flex flex-row gap-1"><User2 className="w-4 h-4" /> {highlightText(item.username)}</td>
                                        <td className="px-4 py-3 text-sm">{highlightText(item.email)}</td>
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
                                                    onClick={() => handleEdit(item)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item.id || item._id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                                        No cashiers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <AddCashierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={refetch} />

            <EditCashierModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={refetch}
                cashier={selectedCashier}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setCashierToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Cashier"
                message="Are you sure you want to delete this cashier? This action cannot be undone."
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default UserManagement;
