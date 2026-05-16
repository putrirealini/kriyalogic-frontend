import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Search,
    User,
    ClipboardList,
    Trash2,
    ChevronDown,
    LogOut,
    Wallet,
    CreditCard,
    QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useCategories from '../hooks/useCategories';
import useProducts from '../hooks/useProducts';
import useGuides from '../hooks/useTourGuides';
import useDetailParentProduct from '../hooks/useDetailParentProduct';
import allIcon from '../assets/all_icon.svg';
import defaultImage from '../../public/default_image.png';

const ITEMS_PER_PAGE = 9;

const formatRupiah = (value) => {
    return `Rp. ${Number(value || 0).toLocaleString('id-ID')}`;
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const POS = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('qris');

    const userMenuRef = useRef(null);
    const guideDropdownRef = useRef(null);

    const {
        categories = [],
        loading: categoriesLoading,
        error: categoriesError
    } = useCategories();

    const {
        products = [],
        loading: productsLoading,
        error: productsError
    } = useProducts();

    const {
        guides = [],
        loading: guidesLoading,
        error: guidesError
    } = useGuides();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedGuideId, setSelectedGuideId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const {
        parentProductDetail,
        loading: detailLoading,
        error: detailError
    } = useDetailParentProduct(selectedCategory !== 'all' ? selectedCategory : null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }

            if (guideDropdownRef.current && !guideDropdownRef.current.contains(event.target)) {
                setIsGuideOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, search]);

    const normalizedCategories = useMemo(() => {
        const mapped = Array.isArray(categories)
            ? categories.map((category) => ({
                id: category?._id || category?.id || '',
                name: category?.name || category?.categoryName || category?.productName || '-',
                normalizedName: normalizeText(
                    category?.name || category?.categoryName || category?.productName
                ),
                logo: category?.logo || category?.coverImage || '',
                total: Number(
                    category?.productCount ??
                    category?.availableCount ??
                    category?.childItemCount ??
                    0
                ) || 0
            }))
            : [];

        return [
            {
                id: 'all',
                name: 'All',
                normalizedName: 'all',
                total: mapped.reduce((acc, item) => acc + Number(item.total || 0), 0),
                logo: allIcon
            },
            ...mapped
        ];
    }, [categories]);

    const normalizedProducts = useMemo(() => {
        if (selectedCategory !== 'all') {
            const childItems =
                parentProductDetail?.childItems ||
                parentProductDetail?.items ||
                parentProductDetail?.productItems ||
                parentProductDetail?.children ||
                [];

            return Array.isArray(childItems)
                ? childItems
                    .filter((item) => normalizeText(item?.status || '') === 'available')
                    .map((item) => ({
                        id: item?._id || item?.id || '',
                        name:
                            item?.itemName ||
                            item?.productName ||
                            parentProductDetail?.productName ||
                            '-',
                        price: Number(item?.sellingPrice ?? 0) || 0,
                        image: item?.productPhoto || '',
                        raw: item
                    }))
                : [];
        }

        return Array.isArray(products)
            ? products
                .filter((product) => {
                    const status = normalizeText(
                        product?.status ||
                        product?.raw?.status ||
                        product?.productItem?.status ||
                        ''
                    );

                    return status === 'available';
                })
                .map((product) => ({
                    id: product?._id || product?.id || '',
                    name:
                        product?.itemName ||
                        product?.productName ||
                        product?.name ||
                        '-',
                    price: Number(product?.sellingPrice ?? 0) || 0,
                    image: product?.productPhoto || product?.image || '',
                    raw: product
                }))
            : [];
    }, [selectedCategory, parentProductDetail, products]);

    const normalizedGuides = useMemo(() => {
        return Array.isArray(guides)
            ? guides.map((guide) => ({
                id: guide?._id || guide?.id,
                name: guide?.guideName || '-',
                commissionRate: Number(guide?.commissionRate || 0)
            }))
            : [];
    }, [guides]);

    const filteredProducts = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return normalizedProducts.filter((product) => {
            const matchesSearch =
                !keyword || String(product.name || '').toLowerCase().includes(keyword);

            return matchesSearch;
        });
    }, [normalizedProducts, search]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage]);

    const selectedGuide = useMemo(() => {
        return normalizedGuides.find((guide) => guide.id === selectedGuideId) || null;
    }, [normalizedGuides, selectedGuideId]);

    const subTotal = useMemo(() => {
        return selectedItems.reduce((acc, item) => acc + Number(item.price || 0), 0);
    }, [selectedItems]);

    const guideCommissionAmount = useMemo(() => {
        if (!selectedGuide) return 0;
        return (subTotal * Number(selectedGuide.commissionRate || 0)) / 100;
    }, [selectedGuide, subTotal]);

    const totalAmount = useMemo(() => {
        return subTotal + guideCommissionAmount;
    }, [subTotal, guideCommissionAmount]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSelectProduct = (product) => {
        if (!product?.id) return;

        setSelectedItems((prev) => {
            const exists = prev.some((item) => item.id === product.id);
            if (exists) return prev;

            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    raw: product.raw
                }
            ];
        });
    };

    const handleRemoveItem = (id) => {
        setSelectedItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleGoToReceiptHistories = () => {
        navigate('/dashboard/pos/receipt-histories');
    };

    const handleGoToOrderPayment = () => {
        if (!selectedItems.length) return;

        navigate('/dashboard/pos/order-payment', {
            state: {
                items: selectedItems,
                subtotal: subTotal,
                totalAmount,
                selectedGuide,
                guideCommissionAmount,
                paymentMethod: selectedPaymentMethod
            }
        });
    };

    const paymentMethods = [
        {
            key: 'cash',
            label: 'Cash',
            icon: <Wallet className="w-7 h-7" />
        },
        {
            key: 'card',
            label: 'Credit/Debit Card',
            icon: <CreditCard className="w-7 h-7" />
        },
        {
            key: 'qris',
            label: 'QRIS',
            icon: <QrCode className="w-7 h-7" />
        }
    ];

    const isProductLoading = selectedCategory === 'all' ? productsLoading : detailLoading;
    const productError = selectedCategory === 'all' ? productsError : detailError;
    const productTitle =
        selectedCategory === 'all'
            ? 'All Product'
            : parentProductDetail?.productName || 'Product Items';

    return (
        <div className="flex-1 grid grid-cols-[1fr_420px] min-h-screen">
            <section className="px-4 py-10 overflow-y-auto">
                <div className="flex items-center justify-between mb-10 gap-6">
                    <h2 className="text-2xl font-bold text-[#5A3B2D]">
                        Choose Parent Product
                    </h2>

                    <div className="relative w-full max-w-[320px]">
                        <input
                            type="text"
                            placeholder="search category or product"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-[#6A4734]"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {categoriesError && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {categoriesError}
                    </div>
                )}

                <div className="flex gap-4 overflow-x-auto pb-3 mb-8">
                    {categoriesLoading ? (
                        <div className="text-sm text-gray-500">Loading categories...</div>
                    ) : (
                        normalizedCategories.map((category) => {
                            const isActive = selectedCategory === category.id;

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`w-[134px] h-[142px] shrink-0 rounded-2xl shadow-md border px-4 py-3 text-left transition flex flex-col ${
                                        isActive
                                            ? 'bg-[#6A4734] text-white border-[#6A4734]'
                                            : 'bg-[#F8F8F8] text-[#2F241F] border-gray-200'
                                    }`}
                                >
                                    <div className={`h-[52px] mb-3 text-2xl flex items-start ${
                                        isActive ? 'text-white/80' : 'text-gray-400'
                                    }`}>
                                        {category.logo ? (
                                            <img
                                                src={category.logo}
                                                alt={category.name}
                                                className={`object-contain transition-all duration-200 ${
                                                    category.name === 'All' ? 'w-8 h-[30px]' : 'w-11 h-[52px]'
                                                }`}
                                                style={{
                                                    filter: isActive
                                                        ? 'brightness(0) saturate(100%) invert(100%)'
                                                        : 'brightness(0) saturate(100%) invert(20%) sepia(19%) saturate(1160%) hue-rotate(338deg) brightness(95%) contrast(90%)'
                                                }}
                                                width={category.name === 'All' ? 32 : 44}
                                                height={category.name === 'All' ? 30 : 52}
                                            />
                                        ) : (
                                            <div className="w-full h-12 rounded-xl bg-[#ECECEC] flex items-center justify-center text-gray-300">
                                                🖼️
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        className="font-semibold text-[12px] leading-[15px] min-h-[30px] line-clamp-2 break-words"
                                        title={category.name}
                                    >
                                        {category.name}
                                    </div>

                                    <div
                                        className={`mt-auto text-xs leading-4 whitespace-nowrap ${
                                            isActive ? 'text-white/80' : 'text-gray-500'
                                        }`}
                                    >
                                        {category.total} products
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                <h3 className="text-[22px] font-bold text-[#5A3B2D] mb-5">
                    {productTitle}
                </h3>

                {productError && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {productError}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                    {isProductLoading ? (
                        <div className="text-sm text-gray-500">Loading products...</div>
                    ) : paginatedProducts.length > 0 ? (
                        paginatedProducts.map((product) => {
                            const isSelected = selectedItems.some((item) => item.id === product.id);

                            return (
                                <button
                                    key={product.id}
                                    onClick={() => handleSelectProduct(product)}
                                    className={`rounded-2xl shadow-sm border p-4 text-left transition ${
                                        isSelected
                                            ? 'bg-[#F3ECE8] border-[#6A4734] shadow-md'
                                            : 'bg-[#F8F8F8] border-gray-200 hover:shadow-md'
                                    }`}
                                >
                                    <div className="w-full h-[170px] rounded-2xl bg-[#ECECEC] flex items-center justify-center mb-4 shadow-md overflow-hidden">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={defaultImage}
                                                alt="Default"
                                                className="w-12 h-12 object-contain"
                                            />
                                        )}
                                    </div>

                                    <div className="font-semibold text-[#3A2C25] text-[14px] leading-6">
                                        {product.name}
                                    </div>

                                    <div className="text-[#5A3B2D] mt-1 font-medium text-[12px]">
                                        {formatRupiah(product.price)}
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500">
                            No products found
                        </div>
                    )}
                </div>

                {!isProductLoading && filteredProducts.length > 0 && (
                    <>
                        <div className="text-sm text-gray-500 text-center mt-2">
                            Showing {paginatedProducts.length} of {filteredProducts.length} products
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6 pb-6">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-[#5A3B2D] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Prev
                                </button>

                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition ${
                                            currentPage === page
                                                ? 'bg-[#6A4734] text-white'
                                                : 'bg-white border border-gray-300 text-[#5A3B2D] hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-[#5A3B2D] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            <aside className="bg-[#F8F8F8] border-l border-gray-200 px-6 py-8 flex flex-col min-h-screen">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[22px] font-bold text-[#5A3B2D]">
                        Order Summary
                    </h2>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleGoToReceiptHistories}
                            className="text-[#6A4734] hover:opacity-80 transition"
                            title="Receipt Histories"
                        >
                            <ClipboardList className="w-7 h-7" />
                        </button>

                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                className="w-10 h-10 bg-[#4E3629] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity focus:outline-none shadow-sm"
                            >
                                <User size={20} />
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {user?.username || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user?.email || 'user@example.com'}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider font-semibold text-[#6A4734] mt-1">
                                            {user?.role || 'Cashier'}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-[1fr_120px_56px] px-6 py-4 text-sm font-semibold text-[#5A463A] border-b border-gray-200">
                        <div>Product</div>
                        <div className="text-right">Price</div>
                        <div />
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                        {selectedItems.length > 0 ? (
                            selectedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-[1fr_120px_56px] px-6 py-4 items-center border-b border-gray-200"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-xl bg-[#ECECEC] flex items-center justify-center shrink-0 overflow-hidden">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={defaultImage}
                                                    alt="Default"
                                                    className="w-8 h-8 object-contain"
                                                />
                                            )}
                                        </div>

                                        <div className="truncate text-[#3A2C25] text-[12px]">
                                            {item.name}
                                        </div>
                                    </div>

                                    <div className="text-right text-[12px] text-[#3A2C25]">
                                        {formatRupiah(item.price)}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="ml-4 w-8 h-8 rounded-xl bg-[#E57B7B] text-white flex items-center justify-center hover:opacity-90"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-10 text-center text-gray-500 text-sm">
                                No selected items yet
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 relative" ref={guideDropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsGuideOpen((prev) => !prev)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 flex items-center justify-between outline-none focus:ring-2 focus:ring-[#6A4734]"
                    >
                        <span className={selectedGuide ? 'text-gray-900' : 'text-gray-400'}>
                            {selectedGuide
                                ? `${selectedGuide.name} (${selectedGuide.commissionRate}%)`
                                : guidesLoading
                                    ? 'Loading tour guides...'
                                    : 'Select Tour Guide (Optional)'}
                        </span>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>

                    {guidesError && (
                        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {guidesError}
                        </div>
                    )}

                    {isGuideOpen && !guidesLoading && (
                        <div className="absolute z-20 mt-2 w-full rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden max-h-72 overflow-y-auto">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedGuideId('');
                                    setIsGuideOpen(false);
                                }}
                                className="w-full text-left px-5 py-4 text-base text-[#4F3427] hover:bg-gray-50 border-b border-gray-100"
                            >
                                Without Tour Guide
                            </button>

                            {normalizedGuides.length > 0 ? (
                                normalizedGuides.map((guide) => (
                                    <button
                                        key={guide.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedGuideId(guide.id);
                                            setIsGuideOpen(false);
                                        }}
                                        className="w-full text-left px-5 py-4 text-base text-[#4F3427] hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="font-medium">{guide.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Commission {guide.commissionRate}%
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-5 py-4 text-sm text-gray-500">
                                    No tour guides available
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-6 bg-[#F2F2F2] rounded-2xl p-6">
                    <div className="space-y-3 text-[#3A2C25]">
                        <div className="flex items-center justify-between text-sm">
                            <span>Subtotal</span>
                            <span className="font-medium">{formatRupiah(subTotal)}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span>Guide Commission</span>
                            <span className="font-medium">
                                {selectedGuide
                                    ? `${selectedGuide.commissionRate}% (${formatRupiah(guideCommissionAmount)})`
                                    : formatRupiah(0)}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-gray-300 my-5" />

                    <div className="flex items-center justify-between">
                        <span className="text-[20px] font-bold text-[#1F1F1F]">
                            Total Amount
                        </span>
                        <span className="text-[22px] font-bold text-[#1F1F1F]">
                            {formatRupiah(totalAmount)}
                        </span>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {paymentMethods.map((method) => {
                            const isActive = selectedPaymentMethod === method.key;

                            return (
                                <button
                                    key={method.key}
                                    type="button"
                                    onClick={() => setSelectedPaymentMethod(method.key)}
                                    className="flex flex-col items-center gap-3"
                                >
                                    <div
                                        className={`w-full h-[76px] rounded-2xl border flex items-center justify-center transition ${
                                            isActive
                                                ? 'bg-[#6A4734] border-[#6A4734] text-white'
                                                : 'bg-white border-[#8D7768] text-[#6A4734]'
                                        }`}
                                    >
                                        {method.icon}
                                    </div>

                                    <span className="text-[12px] font-semibold text-[#5A3B2D] text-center leading-4">
                                        {method.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={handleGoToOrderPayment}
                        disabled={!selectedItems.length}
                        className="w-full rounded-2xl bg-[#6A4734] text-white text-[20px] font-bold py-5 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Place Order
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default POS;