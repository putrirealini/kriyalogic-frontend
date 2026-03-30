import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import useDetailParentProduct from '../hooks/useDetailParentProduct';
import { useNavigate } from 'react-router-dom';
import defaultImage from '../../public/default_image.png';

const InventoryProductDetail = () => {
    const navigate = useNavigate();
    const { parentProduct, loading, error } = useDetailParentProduct();
    const [searchChild, setSearchChild] = useState('');

    const childItems = useMemo(() => {
        const items = parentProduct?.childItems || [];
        const keyword = searchChild.trim().toLowerCase();

        if (!keyword) return items;

        return items.filter((item) => {
            const values = [
                item.productName,
                item.childCode,
                item.status
            ]
                .filter(Boolean)
                .map((value) => value.toLowerCase());

            return values.some((value) => value.includes(keyword));
        });
    }, [parentProduct, searchChild]);

    const totalPieces = useMemo(() => {
        if (typeof parentProduct?.totalChildItems === 'number') {
            return parentProduct.totalChildItems;
        }

        return parentProduct?.childItems?.length || 0;
    }, [parentProduct]);

    const availablePieces = useMemo(() => {
        if (typeof parentProduct?.availableStock === 'number') {
            return parentProduct.availableStock;
        }

        return (parentProduct?.childItems || []).filter(
            (item) => item.status === 'available'
        ).length;
    }, [parentProduct]);

    const woodTypeText = useMemo(() => {
        if (!parentProduct?.woodTypes || !Array.isArray(parentProduct.woodTypes)) {
            return '-';
        }

        return parentProduct.woodTypes.length ? parentProduct.woodTypes[0] : '-';
    }, [parentProduct]);

    const mainImage = useMemo(() => {
        if (parentProduct?.logo) return parentProduct.logo;

        const images = parentProduct?.images || [];
        const cover = images.find((img) => img.isCover);

        return cover?.imageUrl || images?.[0]?.imageUrl || '';
    }, [parentProduct]);

    const getStatusBadgeClass = (status) => {
        const normalized = (status || '').toLowerCase();

        if (normalized === 'available') {
            return 'bg-green-400 text-[#14361e] text-[14px]';
        }

        if (normalized === 'sold') {
            return 'bg-red-400 text-white text-[14px]';
        }

        if (normalized === 'reserved') {
            return 'bg-yellow-300 text-[#4e3b00] text-[14px]';
        }

        return 'bg-gray-300 text-gray-700 text-[14px]';
    };

    const getStatusParentBadgeClass = (status) => {
        const normalized = (status || '').toLowerCase();

        if (normalized === 'active') {
            return 'bg-green-100 text-green-800 text-[14px]';
        }

        if (normalized === 'inactive') {
            return 'bg-red-100 text-red-800 text-[14px]';
        }

        return 'bg-gray-100 text-gray-800 text-[14px]';
    }

    return (
        <div className="w-full px-2 md:px-4 lg:px-6 py-3">
            {loading ? (
                <div className="text-center py-16 text-gray-500">Loading...</div>
            ) : error ? (
                <div className="text-center py-16 text-red-600">Error: {error}</div>
            ) : parentProduct ? (
                <>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/inventory')}
                                className="w-9 h-9 rounded-full bg-[#6A4734] text-white flex items-center justify-center hover:opacity-90"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <h1 className="text-1xl md:text-2xl font-bold text-[#4F3427]">
                                Product Family Details
                            </h1>
                        </div>

                        <div className="relative w-full lg:w-[360px]">
                            <input
                                type="text"
                                value={searchChild}
                                onChange={(e) => setSearchChild(e.target.value)}
                                placeholder="search child product"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-[#6A4734]"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8">
                        <div className="flex align-center justify-center">
                            <div className="bg-transparent">
                                <div>
                                    <h2 className="text-[24px] font-weight-[500] text-[#4F3427] mb-5">
                                        {parentProduct.productName} Detail
                                    </h2>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-full max-w-[591px] h-[280px] rounded-3xl bg-[#E9ECEF] flex items-center justify-center overflow-hidden mb-8">
                                        {mainImage ? (
                                            <img
                                                src={mainImage}
                                                alt={parentProduct.productName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <div className="text-6xl mb-3">🖼️</div>
                                                <p className="text-sm">No image</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-[250px_1fr] gap-y-2 gap-x-1 max-w-[591px] text-[18px]">
                                        <div className="text-black text-[16px]">Category</div>
                                        <div className="text-right text-black text-[16px]">
                                            {parentProduct.categoryName || '-'}
                                        </div>

                                        <div className="text-black text-[16px]">Status</div>
                                        <div className="text-right text-black text-[16px]">
                                            <span
                                                className={`px-4 py-1 rounded-full capitalize ${getStatusParentBadgeClass(
                                                    parentProduct.status
                                                )}`}
                                            >
                                                {parentProduct.status || '-'}
                                            </span>
                                        </div>

                                        <div className="text-black text-[16px]">Parent Code</div>
                                        <div className="text-right text-black text-[16px]">
                                            {parentProduct.parentCode || '-'}
                                        </div>

                                        <div className="text-black text-[16px]">Wood Type</div>
                                        <div className="text-right text-black text-[16px]">
                                            {woodTypeText}
                                        </div>

                                        <div className="text-black text-[16px]">Description</div>
                                        <div className="text-right text-black text-[16px]">
                                            {parentProduct.description || '-'}
                                        </div>

                                        <div className="text-black text-[16px]">Total Pieces</div>
                                        <div className="text-right text-black text-[16px]">{totalPieces}</div>

                                        <div className="text-black text-[16px]">Available Pieces</div>
                                        <div className="text-right text-black text-[16px]">{availablePieces}</div>
                                    </div>

                                    <div className="mt-14">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/dashboard/inventory/edit/${parentProduct._id}`)}
                                            className="min-w-[180px] rounded-xl bg-[#6A4734] text-white px-6 py-3 font-medium hover:opacity-90 transition"
                                        >
                                            Edit Parent Detail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#F7F7F7] rounded-3xl p-6 flex flex-col min-h-[680px]">
                            <h3 className="text-[24px] font-weight-[500] text-[#4F3427] mb-4">
                                Child Product List
                            </h3>

                            <div className="rounded-2xl overflow-hidden bg-white border border-gray-200">
                                <div className="grid grid-cols-[1.5fr_1fr_110px] gap-4 px-6 py-4 border-b border-gray-200 text-sm font-semibold text-[#5A463A]">
                                    <div>Name Product</div>
                                    <div>Child Code</div>
                                    <div className="text-center">Status</div>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {childItems.length > 0 ? (
                                        childItems.map((item, index) => (
                                            <div
                                                key={item._id || item.childCode || index}
                                                className="grid grid-cols-[1.5fr_1fr_110px] gap-4 px-6 py-3 items-center"
                                                onClick={() => {
                                                    navigate(`/dashboard/inventory/edit/child-product/${item._id}`);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                                        {item.productPhoto ? (
                                                            <img
                                                                src={item.productPhoto}
                                                                alt={item.productName || parentProduct.productName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={defaultImage}
                                                                alt="Default"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>

                                                    <span className="truncate text-[#3D312B] text-[14px]">
                                                        {item.productName || parentProduct.productName}
                                                    </span>
                                                </div>

                                                <div className="text-[#3D312B] truncate text-[14px]">
                                                    {item.childCode || '-'}
                                                </div>

                                                <div className="flex justify-center">
                                                    <span
                                                        className={`px-4 py-1 rounded-full capitalize ${getStatusBadgeClass(
                                                            item.status
                                                        )}`}
                                                    >
                                                        {item.status || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-6 py-12 text-center text-gray-400">
                                            No child product found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-8 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/dashboard/inventory/add/child-product?parentId=${parentProduct._id}`)}
                                    className="min-w-[190px] rounded-xl bg-[#6A4734] text-white px-6 py-3 font-medium hover:opacity-90 transition"
                                >
                                    Add Child Product
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    No product details available.
                </div>
            )}
        </div>
    );
};

export default InventoryProductDetail;