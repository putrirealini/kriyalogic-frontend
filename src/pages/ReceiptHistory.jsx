import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Search, LogOut, User, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useReceiptHistories from '../hooks/useReceiptHistories';
import useReceiptHistoryDetail from '../hooks/useReceiptHistoryDetail';
import { useAuth } from '../context/AuthContext';
import logoImage from '../../public/logo.png';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

const formatRupiah = (value) => {
    return `Rp. ${Number(value || 0).toLocaleString('id-ID')}`;
};

const formatDateTime = (value) => {
    if (!value) return '-';

    return new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }) + ' WITA';
};

const ReceiptHistory = () => {
    const navigate = useNavigate();

    const { logout, user } = useAuth();
    const receiptPdfRef = useRef(null);
    const userMenuRef = useRef(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedReceiptId, setSelectedReceiptId] = useState('');

    const {
        receiptHistories,
        pagination,
        loading,
        error
    } = useReceiptHistories({
        search,
        page,
        limit: 10
    });

    const {
        receiptDetail,
        loading: detailLoading,
        error: detailError
    } = useReceiptHistoryDetail(selectedReceiptId);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!selectedReceiptId && receiptHistories.length > 0) {
            setSelectedReceiptId(receiptHistories[0]._id);
        }
    }, [receiptHistories, selectedReceiptId]);

    const previewDetail = useMemo(() => {
        if (receiptDetail) return receiptDetail;
        if (receiptHistories.length > 0) return receiptHistories[0];
        return null;
    }, [receiptDetail, receiptHistories]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleBack = () => {
        navigate('/dashboard/pos');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDownloadReceiptPdf = async () => {
        try {
            if (!receiptPdfRef.current) return;

            const canvas = await html2canvas(receiptPdfRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');

            const pageWidth = 80; // thermal receipt
            const margin = 4;
            const contentWidth = pageWidth - margin * 2;
            const contentHeight = (canvas.height * contentWidth) / canvas.width;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [pageWidth, contentHeight + margin * 2]
            });

            pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
            pdf.save(`receipt-${previewDetail?.receiptNumber || 'transaction'}.pdf`);
        } catch (error) {
            console.error('PDF ERROR:', error);
            toast.error('Failed to generate receipt PDF');
        }
    };

    return (
        <div className="px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="w-10 h-10 rounded-full bg-[#6A4734] text-white flex items-center justify-center hover:opacity-90"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <h1 className="text-[22px] font-bold text-[#5A3B2D]">
                        Receipt History
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
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

            <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-8">
                {/* LEFT */}
                <section>
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search Receipt no, date or customer"
                                className="w-full h-12 rounded-xl border border-gray-300 bg-[#F8F8F8] px-4 pr-12 outline-none focus:ring-2 focus:ring-[#6A4734]"
                            />
                            <button
                                type="submit"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {loading ? (
                            <div className="rounded-2xl bg-white border border-gray-200 p-6 text-gray-500">
                                Loading receipt histories...
                            </div>
                        ) : receiptHistories.length > 0 ? (
                            receiptHistories.map((item) => {
                                const isActive = selectedReceiptId === item._id;

                                return (
                                    <button
                                        key={item._id}
                                        type="button"
                                        onClick={() => setSelectedReceiptId(item._id)}
                                        className={`w-full text-left rounded-2xl border p-5 shadow-sm transition ${
                                            isActive
                                                ? 'bg-[#F5F5F5] border-[#6A4734] shadow-md'
                                                : 'bg-[#F5F5F5] hover:bg-[#F0F0F0]'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-6">
                                            <div className="space-y-2 text-[#1B1957]">
                                                <p className="text-sm font-medium">
                                                    Date {formatDateTime(item.paidAt)}
                                                </p>
                                                <p className="text-sm font-semibold">
                                                    Receipt No #{item.receiptNumber}
                                                </p>
                                                <p className="text-sm font-medium">
                                                    Customer / {item.customerName || '-'}
                                                </p>
                                                <p className="text-sm font-medium">
                                                    Cashier / {item.cashierName || '-'}
                                                </p>
                                            </div>

                                            <div className="space-y-2 text-right text-[#1B1957]">
                                                <p className="text-sm font-semibold capitalize">
                                                    {item.status || 'Paid'}
                                                </p>
                                                <p className="text-sm font-semibold">
                                                    Total {formatRupiah(item.totalAmount)}
                                                </p>
                                                <p className="text-sm font-semibold capitalize">
                                                    Paid with {item.paymentMethod}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                                No receipt histories found
                            </div>
                        )}
                    </div>

                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page <= 1}
                                className="px-4 py-2 rounded-xl border border-gray-300 bg-white disabled:opacity-50"
                            >
                                Prev
                            </button>

                            <span className="text-sm text-gray-600">
                                Page {pagination.page} of {pagination.pages}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage((prev) =>
                                        Math.min(prev + 1, pagination.pages)
                                    )
                                }
                                disabled={page >= pagination.pages}
                                className="px-4 py-2 rounded-xl border border-gray-300 bg-white disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>

                {/* RIGHT */}
                <aside className="bg-transparent">
                    {detailError && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {detailError}
                        </div>
                    )}

                    {detailLoading && !previewDetail ? (
                        <div className="rounded-3xl bg-white border border-gray-200 p-8 text-gray-500">
                            Loading receipt detail...
                        </div>
                    ) : previewDetail ? (
                        <div className="rounded-3xl px-4">
                            <div
                                ref={receiptPdfRef}
                                className="mx-auto w-full max-w-[300px] bg-white text-[#4E3629] p-4"
                                style={{
                                    fontFamily: 'Arial, sans-serif',
                                    lineHeight: 1.4
                                }}
                            >
                                {/* Header */}
                                <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                                    <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                                        <img
                                            src={logoImage}
                                            alt="KriyaLogic Logo"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>

                                    <h2 className="text-[18px] font-bold text-[#5A3B2D]">
                                        KriyaLogic
                                    </h2>

                                    <div className="text-[#6B4C3B] text-[10px] mt-1">
                                        Empowering Craftsmanship with Digital Logic
                                    </div>

                                    <p className="text-[#6B4C3B] text-[10px] mt-2">
                                        Jl. Ir. Sutami, Kemenuh, Kec. Sukawati, Kabupaten Gianyar, Bali
                                    </p>
                                </div>

                                {/* Receipt info */}
                                <div className="text-[10px] text-[#4E3629] space-y-1 border-b border-dashed border-gray-300 pb-3 mb-3">
                                    <div className="flex justify-between gap-3">
                                        <span className="font-semibold">Receipt No</span>
                                        <span className="text-right">#{previewDetail.receiptNumber}</span>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <span className="font-semibold">Date</span>
                                        <span className="text-right">{formatDateTime(previewDetail.paidAt)}</span>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <span className="font-semibold">Cashier</span>
                                        <span className="text-right">{previewDetail.cashierName || '-'}</span>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <span className="font-semibold">Customer</span>
                                        <span className="text-right">{previewDetail.customerName || '-'}</span>
                                    </div>
                                </div>

                                {/* Payment details */}
                                <div className="mb-3">
                                    <h3 className="text-[12px] font-bold text-[#5A3B2D] mb-2">
                                        Payment Details
                                    </h3>

                                    <div className="border-y border-dashed border-gray-300 py-2">
                                        <div className="grid grid-cols-[1fr_35px_80px] gap-2 text-[10px] font-bold mb-2">
                                            <div>Item</div>
                                            <div className="text-center">Qty</div>
                                            <div className="text-right">Total</div>
                                        </div>

                                        <div className="space-y-2 text-[10px]">
                                            {(previewDetail.items || []).map((item, index) => (
                                                <div
                                                    key={item.productItemId || index}
                                                    className="grid grid-cols-[1fr_35px_80px] gap-2"
                                                >
                                                    <div className="break-words">
                                                        {item.itemName}
                                                    </div>
                                                    <div className="text-center">
                                                        {item.qty || 1}
                                                    </div>
                                                    <div className="text-right font-medium">
                                                        {formatRupiah(
                                                            Number(item.price || 0) * Number(item.qty || 1)
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction details */}
                                <div className="mb-3">
                                    <h4 className="text-[12px] font-bold text-[#5A3B2D] mb-2">
                                        Transaction Details
                                    </h4>

                                    <div className="space-y-1 text-[10px]">
                                        <div className="flex justify-between gap-4">
                                            <span>Amount paid</span>
                                            <span>{formatRupiah(previewDetail.amountPaid)}</span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span>Change money</span>
                                            <span>{formatRupiah(previewDetail.changeAmount)}</span>
                                        </div>

                                        <div className="flex justify-between gap-4 capitalize">
                                            <span>Payment method</span>
                                            <span>{previewDetail.paymentMethod}</span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span>Tour Guide commission</span>
                                            <span>
                                                {formatRupiah(previewDetail.guideCommissionAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="text-center border-t border-dashed border-gray-300 pt-3 mt-3">
                                    <h3 className="text-[16px] font-bold text-[#5A3B2D]">
                                        Have a Nice Day!
                                    </h3>

                                    <p className="text-[#6B4C3B] mt-1 text-[10px]">
                                        No return or exchange accepted without receipt
                                    </p>

                                    <div className="mt-4">
                                        <h4 className="text-[11px] font-bold text-[#5A3B2D]">
                                            Get in touch
                                        </h4>
                                        <p className="text-[10px] mt-1 text-[#6B4C3B]">
                                            @wahanagiri
                                        </p>
                                        <p className="text-[10px] mt-1 text-[#6B4C3B]">
                                            +62001234567
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons - outside PDF area */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={handleDownloadReceiptPdf}
                                    className="h-12 rounded-2xl bg-[#6A4734] text-white font-semibold hover:opacity-90"
                                >
                                    Download PDF
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadReceiptPdf}
                                    className="h-12 rounded-2xl bg-[#6A4734] text-white font-semibold hover:opacity-90"
                                >
                                    Print Receipt
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                            Select a receipt to preview
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default ReceiptHistory;