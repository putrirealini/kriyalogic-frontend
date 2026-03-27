import React, { useState } from 'react';
import { Search, Plus, Trash2, Pencil, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useParentProducts from '../hooks/useParentProducts';
import useDeleteParentProduct from '../hooks/useDeleteParentProduct';

const Inventory = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [parentProductToDelete, setParentProductToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { parentProducts, loading, error, refetch } = useParentProducts();
    const {
        deleteParentProduct,
        loading: deleteLoading,
        error: deleteError,
        setError: setDeleteError,
    } = useDeleteParentProduct();

    const filteredParentProducts = parentProducts.filter((parentProduct) =>
        (parentProduct.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (parentProduct.parentCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (parentProduct.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteClick = (item) => {
        setParentProductToDelete(item);
        setIsDeleteModalOpen(true);
        setDeleteError(null);
    };

    const handleCloseDeleteModal = () => {
        setParentProductToDelete(null);
        setIsDeleteModalOpen(false);
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        if (!parentProductToDelete?._id && !parentProductToDelete?.id) return;

        const id = parentProductToDelete._id || parentProductToDelete.id;
        const result = await deleteParentProduct(id);

        if (result.success) {
            handleCloseDeleteModal();
            refetch();
        }
    };

    return (
        <div>
            <div className='mt-4 px-4 md:px-24 flex flex-col md:flex-row justify-between gap-4'>
                <div className='flex flex-col md:flex-row gap-4 w-full md:w-auto'>
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
                    <Link
                        to="/dashboard/inventory/add"
                        className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors w-full md:w-auto text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add Parent Product
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto px-4 md:px-24 mt-4 pb-20">
                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-600">Error: {error}</div>
                ) : (
                    <table className="w-full border-collapse rounded-lg overflow-hidden bg-[#F5F5F5]">
                        <thead className="bg-primary text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                    Product Name
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                    Parent Code
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                    Category
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                    Available Stock
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredParentProducts.length > 0 ? (
                                filteredParentProducts.map((item) => (
                                    <tr
                                        key={item._id || item.id}
                                        className="border-b last:border-b-0 hover:bg-gray-50"
                                        onClick={() => {
                                            navigate(`/dashboard/inventory/detail/${item._id || item.id}`);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center gap-3">
                                                {item.logo ? (
                                                    <img
                                                        src={item.logo}
                                                        alt={item.productName || 'Product logo'}
                                                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-white shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-xs shrink-0">
                                                        No Img
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {item.productName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm">{item.parentCode || '-'}</td>
                                        <td className="px-4 py-3 text-sm">{item.categoryName || '-'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {item.availableStock !== undefined ? item.availableStock : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    className="text-blue-600 hover:text-blue-800"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/dashboard/inventory/edit/${item._id || item.id}`);
                                                    }}
                                                >
                                                    <Pencil size={18} />
                                                </button>

                                                <button
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(item);
                                                    }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                        No parent products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-xl font-bold text-[#4F3427]">
                                Delete Parent Product
                            </h2>

                            <button
                                type="button"
                                onClick={handleCloseDeleteModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-[#4F3427]">
                                {parentProductToDelete?.productName || 'this product'}
                            </span>
                            ?
                        </p>

                        <p className="text-xs text-red-500 mb-4">
                            This action cannot be undone.
                        </p>

                        {deleteError && (
                            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseDeleteModal}
                                className="min-w-[110px] rounded-xl bg-gray-100 text-gray-700 px-4 py-2 font-medium hover:bg-gray-200 transition"
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="min-w-[110px] rounded-xl bg-red-600 text-white px-4 py-2 font-medium hover:bg-red-700 transition disabled:opacity-60"
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;