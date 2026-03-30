import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import useArtisanCommissions from '../hooks/useArtisanCommissions';
import useMarkAllArtisanCommissionPaid from '../hooks/useMarkAllArtisanCommissionPaid';
import useMarkSelectedArtisanCommissionPaid from '../hooks/useMarkSelectedArtisanCommissionPaid';
import useExportArtisanCommissionsExcel from '../hooks/useExportArtisanCommissionsExcel';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const formatRupiah = (value) => {
    return `Rp. ${Number(value || 0).toLocaleString('id-ID')}`;
};

const ArtisanCommissionPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const pdfRef = useRef(null);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('unpaid');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedCommissionIds, setSelectedCommissionIds] = useState([]);

    const {
        commissions,
        totalPending,
        artisanId,
        artisanName,
        loading,
        error,
        refetch
    } = useArtisanCommissions({
        id,
        search,
        status,
        fromDate,
        toDate
    });

    const {
        markAllPaid,
        loading: markAllPaidLoading,
        error: markAllPaidError
    } = useMarkAllArtisanCommissionPaid();

    const {
        markSelectedPaid,
        loading: markSelectedPaidLoading,
        error: markSelectedPaidError
    } = useMarkSelectedArtisanCommissionPaid();

    const unpaidCommissions = useMemo(() => {
        return commissions.filter((item) => item.status === 'unpaid');
    }, [commissions]);

    const selectedUnpaidCount = selectedCommissionIds.length;

    const isAllUnpaidSelected =
        unpaidCommissions.length > 0 &&
        unpaidCommissions.every((item) => selectedCommissionIds.includes(item._id));

    const {
        exportExcel,
        loading: exportLoading,
        error: exportError
    } = useExportArtisanCommissionsExcel();

    useEffect(() => {
        setSelectedCommissionIds((prev) =>
            prev.filter((id) => commissions.some((item) => item._id === id && item.status === 'unpaid'))
        );
    }, [commissions]);

    const title = useMemo(() => {
        return `Artisan Commission ${artisanName || ''}`.trim();
    }, [artisanName]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearch(searchInput.trim());
    };

    const handleMarkAllPaid = async () => {
        if (!window.confirm('Mark all unpaid commissions as paid?')) return;

        const result = await markAllPaid(id);

        if (!result.success) {
            toast.error(result.error || 'Failed to mark commissions as paid');
            return;
        }

        toast.success(result.message || 'All commissions marked as paid');
        refetch();
    };

    const handleMarkSelectedPaid = async () => {
        if (!selectedCommissionIds.length) {
            toast.error('Please select unpaid commissions first');
            return;
        }

        if (!window.confirm(`Mark ${selectedCommissionIds.length} selected commission(s) as paid?`)) {
            return;
        }

        const result = await markSelectedPaid({
            artisanId: id,
            commissionIds: selectedCommissionIds
        });

        if (!result.success) {
            toast.error(result.error || 'Failed to mark selected commissions as paid');
            return;
        }

        toast.success(result.message || 'Selected commissions marked as paid');
        setSelectedCommissionIds([]);
        refetch();
    };

    const handleDownloadPdf = async () => {
        try {
            if (!pdfRef.current) return;

            const canvas = await html2canvas(pdfRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                windowWidth: pdfRef.current.scrollWidth
            });

            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;

            const contentWidth = pageWidth - margin * 2;
            const contentHeight = (canvas.height * contentWidth) / canvas.width;

            let heightLeft = contentHeight;
            let position = margin;

            pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
            heightLeft -= (pageHeight - margin * 2);

            while (heightLeft > 0) {
                position = margin - (contentHeight - heightLeft);
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
                heightLeft -= (pageHeight - margin * 2);
            }

            const safeArtisanName = (artisanName || 'artisan')
                .toString()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .toLowerCase();

            pdf.save(`artisan-commission-${safeArtisanName}.pdf`);
        } catch (error) {
            toast.error('Failed to download PDF');
        }
    };

    const handleExportExcel = async () => {
        const result = await exportExcel({
            id,
            search,
            status,
            fromDate,
            toDate
        });

        if (!result.success) {
            toast.error(result.error || 'Failed to export Excel');
        }
    };

    const handleToggleCommission = (commissionId) => {
        setSelectedCommissionIds((prev) =>
            prev.includes(commissionId)
                ? prev.filter((id) => id !== commissionId)
                : [...prev, commissionId]
        );
    };

    const handleToggleSelectAllUnpaid = () => {
        if (isAllUnpaidSelected) {
            setSelectedCommissionIds([]);
            return;
        }

        setSelectedCommissionIds(unpaidCommissions.map((item) => item._id));
    };

    return (
        <div className="min-h-screen px-2 py-2">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-[#6A4734] text-white flex items-center justify-center hover:opacity-90"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <h1 className="text-[24px] font-bold text-[#5A3B2D]">
                        {title}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px_180px_180px] gap-4 mb-8">
                <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search product"
                        className="w-full h-12 rounded-xl border border-gray-300 bg-[#F8F8F8] px-4 pr-12 outline-none focus:ring-2 focus:ring-[#6A4734]"
                    />
                    <button
                        type="submit"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </form>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-12 rounded-xl border border-gray-300 bg-[#F8F8F8] px-4 outline-none focus:ring-2 focus:ring-[#6A4734]"
                >
                    <option value="unpaid">Filter: pending payout</option>
                    <option value="paid">Filter: paid</option>
                    <option value="all">Filter: all</option>
                </select>

                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-12 rounded-xl border border-gray-300 bg-[#F8F8F8] px-4 outline-none focus:ring-2 focus:ring-[#6A4734]"
                />

                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-12 rounded-xl border border-gray-300 bg-[#F8F8F8] px-4 outline-none focus:ring-2 focus:ring-[#6A4734]"
                />
            </div>

            {(error || markSelectedPaidError || exportError) && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error || markSelectedPaidError || exportError}
                </div>
            )}

            <div ref={pdfRef} className="bg-[#F8F8F8] rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-[60px_90px_1.4fr_1fr_1fr_160px] px-9 py-7 text-[16px] font-bold text-[#1F1F1F] border-b border-gray-300">
                    <div>
                        <input
                            type="checkbox"
                            checked={isAllUnpaidSelected}
                            onChange={handleToggleSelectAllUnpaid}
                            disabled={!unpaidCommissions.length}
                            className="w-4 h-4 accent-[#6A4734]"
                        />
                    </div>
                    <div>No</div>
                    <div>Item Name</div>
                    <div>Child Code</div>
                    <div>Commission</div>
                    <div>Status</div>
                </div>

                {loading ? (
                    <div className="px-9 py-10 text-gray-500">Loading artisan commissions...</div>
                ) : commissions.length > 0 ? (
                    commissions.map((item, index) => (
                        <div
                            key={item._id}
                            className="grid grid-cols-[60px_90px_1.4fr_1fr_1fr_160px] px-9 py-5 items-center border-b border-gray-300 last:border-b-0"
                        >
                            <div>
                                {item.status === 'unpaid' ? (
                                    <input
                                        type="checkbox"
                                        checked={selectedCommissionIds.includes(item._id)}
                                        onChange={() => handleToggleCommission(item._id)}
                                        className="w-4 h-4 accent-[#6A4734]"
                                    />
                                ) : null}
                            </div>

                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-20 h-16 rounded-2xl bg-[#ECECEC] overflow-hidden flex items-center justify-center shrink-0">
                                    {item.productPhoto ? (
                                        <img
                                            src={item.productPhoto}
                                            alt={item.itemName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-xs">No Img</span>
                                    )}
                                </div>

                                <div className="truncate text-[16px] text-[#1F1F1F] font-medium">
                                    {item.itemName || '-'}
                                </div>
                            </div>

                            <div className="text-[16px] text-[#1F1F1F]">
                                {item.childCode || '-'}
                            </div>

                            <div className="text-[16px] text-[#1F1F1F]">
                                {formatRupiah(item.commissionAmount)}
                            </div>

                            <div>
                                <span
                                    className={`inline-flex items-center justify-center min-w-[110px] px-4 py-2 rounded-full text-sm font-medium ${
                                        item.status === 'paid'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-300 text-[#551515]'
                                    }`}
                                >
                                    {item.status === 'paid' ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="px-9 py-12 text-center text-gray-500">
                        No artisan commission data found
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-5 mt-10">
                <div className="text-[18px] font-bold text-[#1F1F1F] mr-4">
                    Total Pending Payout
                </div>

                <div className="text-[18px] font-bold text-[#1F1F1F] min-w-[180px] text-right">
                    {formatRupiah(totalPending)}
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 mt-8">
                {/* <button
                    type="button"
                    onClick={handleExportExcel}
                    className="h-14 min-w-[260px] rounded-2xl border border-[#6A4734] text-[#6A4734] bg-white text-[18px] font-bold hover:bg-[#f7f2ee]"
                >
                    Export to Excel
                </button> */}
                <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={exportLoading}
                    className="h-14 min-w-[260px] rounded-2xl border border-[#6A4734] text-[#6A4734] bg-white text-[18px] font-bold hover:bg-[#f7f2ee] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {exportLoading ? 'Exporting...' : 'Export Excel'}
                </button>

                <button
                    type="button"
                    onClick={handleMarkSelectedPaid}
                    disabled={markSelectedPaidLoading || selectedCommissionIds.length <= 0}
                    className="h-14 min-w-[260px] rounded-2xl bg-[#6A4734] text-white text-[18px] font-bold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {markSelectedPaidLoading ? 'Processing...' : 'Mark Selected as Paid'}
                </button>
            </div>
        </div>
    );
};

export default ArtisanCommissionPage;