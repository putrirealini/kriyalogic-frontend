import React, { useEffect, useMemo, useState } from 'react';
import {
    BadgeDollarSign,
    ChartNoAxesCombined,
    Download,
    Flag,
    ShoppingBag,
    Trophy,
    User,
    WalletCards
} from 'lucide-react';
import useDailyReport from '../hooks/useDailyReport';

const formatRupiah = (value) => {
    return `Rp. ${Number(value || 0).toLocaleString('id-ID')}`;
};

const formatRupiahCompact = (value) => {
    const number = Number(value || 0);

    if (number >= 1000000) {
        return `Rp ${(number / 1000000).toFixed(number % 1000000 === 0 ? 0 : 1)}m`;
    }

    if (number >= 1000) {
        return `Rp ${(number / 1000).toFixed(number % 1000 === 0 ? 0 : 1)}k`;
    }

    return `Rp ${number.toLocaleString('id-ID')}`;
};

const formatDisplayDate = (value) => {
    if (!value) return new Date().toLocaleDateString('id-ID');
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('id-ID');
};

const formatVerifiedDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const TransactionPage = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [actualCash, setActualCash] = useState('');
    const [cashierNotes, setCashierNotes] = useState('');

    const params = useMemo(() => ({
        fromDate,
        toDate
    }), [fromDate, toDate]);

    const {
        report,
        loading,
        closing,
        error,
        closeRegister
    } = useDailyReport(params);

    useEffect(() => {
        if (report?.registerClosure?.actualCash) {
            setActualCash(String(report.registerClosure.actualCash));
        } else {
            setActualCash('');
        }

        setCashierNotes(report?.registerClosure?.cashierNotes || '');
    }, [report?.registerClosure?.actualCash, report?.registerClosure?.cashierNotes]);

    const paymentBreakdown = report?.paymentBreakdown || {
        cash: 0,
        qris: 0,
        card: 0
    };

    const cashAmount = Number(paymentBreakdown.cash || 0);
    const qrisAmount = Number(paymentBreakdown.qris || 0);
    const cardAmount = Number(paymentBreakdown.card || 0);
    const totalPaymentBreakdown = cashAmount + qrisAmount + cardAmount;

    const chartStops = useMemo(() => {
        if (!totalPaymentBreakdown) {
            return {
                cashEnd: 33,
                qrisEnd: 66
            };
        }

        const cashEnd = (cashAmount / totalPaymentBreakdown) * 100;
        const qrisEnd = cashEnd + (qrisAmount / totalPaymentBreakdown) * 100;

        return {
            cashEnd,
            qrisEnd
        };
    }, [cashAmount, qrisAmount, totalPaymentBreakdown]);

    const cashierName = report?.cashier?.name || '-';
    const cashierInitials = cashierName.slice(0, 2).toUpperCase();
    const expectedDrawerCash = Number(report?.drawerCash?.expected || 0);
    const isRegisterClosed = Boolean(report?.registerClosure?.isClosed);

    const handleCloseRegister = async () => {
        if (!actualCash.trim()) {
            alert('Please input actual cash first');
            return;
        }

        const result = await closeRegister({
            fromDate,
            toDate,
            actualCash: Number(actualCash),
            cashierNotes
        });

        if (!result.success) {
            alert(result.error || 'Failed to close register');
            return;
        }

        alert('Register closed successfully');
    };

    const handleDownloadPdfReport = () => {
        alert('Download PDF report clicked');
    };

    return (
        <div className="w-full px-1 pb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                <h1 className="text-[24px] font-bold text-[#4F3529] leading-tight">
                    Daily Cashier Transactions Report
                </h1>

                <div className="flex items-center gap-2 md:gap-3">
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="h-[36px] w-[132px] rounded-[10px] border border-[#D8D8D8] bg-white px-4 text-center text-xs text-[#6F625C] outline-none focus:ring-2 focus:ring-[#6A4734]"
                    />
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="h-[36px] w-[132px] rounded-[10px] border border-[#D8D8D8] bg-white px-4 text-center text-xs text-[#6F625C] outline-none focus:ring-2 focus:ring-[#6A4734]"
                    />
                    <button
                        type="button"
                        className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shrink-0"
                        aria-label="User profile"
                    >
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {loading && (
                <div className="mb-4 rounded-2xl bg-white border border-gray-200 px-4 py-3 text-gray-500">
                    Loading daily report...
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-red-600">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
                <div className="lg:col-span-8 bg-[#6A4734] rounded-[20px] px-8 py-5 text-white flex items-center min-h-[98px]">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.9px] font-bold opacity-90 mb-2">
                            Cashier On Duty
                        </p>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#D9D9D9] text-[#77706B] flex items-center justify-center font-bold text-[18px]">
                                {cashierInitials}
                            </div>

                            <div>
                                <h2 className="text-[20px] font-bold leading-tight">
                                    {cashierName}
                                </h2>
                                <p className="text-[10px] opacity-90 mt-1">
                                    {report?.cashier?.shift || 'Morning Shift: (08:00 - 17:00)'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="lg:col-span-4 bg-white rounded-[20px] border border-[#D9D9D9] shadow-sm px-8 py-5 flex flex-col justify-center min-h-[98px]"
                    style={{ borderTop: '4px solid #6A4734' }}
                >
                    <p className="text-[10px] uppercase tracking-[0.5px] font-bold text-[#6B5A52] mb-1">
                        NET SALES ON {formatDisplayDate(toDate || fromDate)}
                    </p>

                    <h2 className="text-[22px] font-bold text-[#4F3529] leading-tight">
                        {formatRupiah(report?.netSalesToday || 0)}
                    </h2>

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[#9D8E86]">
                        <span className="px-2 py-1 rounded-md bg-[#FAFAFA] border border-[#EDEDED]">
                            {report?.invoiceCount || 0} Invoices
                        </span>
                        <span className="px-2 py-1 rounded-md bg-[#FAFAFA] border border-[#EDEDED]">
                            {report?.totalItemsSold || 0} Items
                        </span>
                    </div>
                </div>
            </div>

            <section className="mb-8">
                <h2 className="text-[18px] font-bold text-[#4F3529] mb-3">
                    Financial & Reconciliation
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-[32px] border border-[#D9D9D9] shadow-sm px-5 py-5 min-h-[170px] flex flex-col">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-[#F5F6F0] flex items-center justify-center text-[#14BA62]">
                                <BadgeDollarSign className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-[#4F3529] text-[13px]">Cash Flow</h3>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[#9D8E86] text-[12px]">Starting Cash</span>
                                <span className="font-bold text-[#4F3529] text-[12px]">
                                    {formatRupiah(report?.cashFlow?.startingCash || 0)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[#9D8E86] text-[12px]">Cash Sales</span>
                                <span className="font-bold text-[#4F3529] text-[12px]">
                                    {formatRupiah(report?.cashFlow?.cashSales || 0)}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-full" style={{ height: '5px', marginTop: '36px', backgroundColor: '#D6D2CF' }} />
                    </div>

                    <div className="bg-white rounded-[32px] border border-[#D9D9D9] shadow-sm px-5 py-5 min-h-[170px] flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isRegisterClosed ? 'bg-[#DDEBFF] text-[#4C99F8]' : 'bg-[#DDF9E7] text-[#14BA62]'}`}>
                                <WalletCards className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-[#4F3529] text-[13px]">Drawer Cash</h3>
                        </div>

                        <div className="flex items-start justify-between gap-3 mb-4">
                            <p className="text-[8px] uppercase tracking-[0.6px] font-bold text-[#B0A29A] mt-1">
                                {isRegisterClosed ? 'Reported Actual' : 'Expected'}
                            </p>

                            <h2 className="text-[18px] font-bold text-[#4F3529] leading-none">
                                {formatRupiah(isRegisterClosed ? report?.registerClosure?.actualCash || 0 : expectedDrawerCash)}
                            </h2>
                        </div>

                        {isRegisterClosed ? (
                            <p className="text-[9px] italic text-[#9D8E86] min-h-[30px]">
                                *Actual cash was verified by {report?.registerClosure?.verifiedBy || cashierName} on {formatVerifiedDate(report?.registerClosure?.closedAt)}
                            </p>
                        ) : (
                            <input
                                type="text"
                                placeholder="Actual cash..."
                                value={actualCash}
                                onChange={(e) => setActualCash(e.target.value.replace(/[^\d]/g, ''))}
                                className="h-[30px] rounded-xl bg-[#FAFAFA] border border-[#D9D9D9] px-4 text-[12px] text-[#4F3529] outline-none focus:ring-2 focus:ring-[#13C257]"
                            />
                        )}

                        <div
                            className="rounded-full"
                            style={{
                                height: '5px',
                                marginTop: '16px',
                                backgroundColor: isRegisterClosed ? '#4C99F8' : '#13C257'
                            }}
                        />
                    </div>

                    <div className="bg-white rounded-[32px] border border-[#D9D9D9] shadow-sm px-5 py-5 min-h-[170px] flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-[#FFE6C2] flex items-center justify-center text-[#579DE8]">
                                <ChartNoAxesCombined className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-[#4F3529] text-[13px]">
                                {isRegisterClosed ? 'Daily Revenue' : 'Total Revenue'}
                            </h3>
                        </div>

                        <p className="text-[10px] uppercase tracking-[0.6px] font-bold text-[#B0A29A] mb-2">
                            {isRegisterClosed ? 'Total Omzet' : 'Gross Omzet'}
                        </p>

                        <h2 className="text-[24px] font-bold text-[#4F3529] leading-none">
                            {formatRupiah(report?.totalRevenue || 0)}
                        </h2>

                        <div className="rounded-full" style={{ height: '5px', marginTop: '36px', backgroundColor: '#FF8A00' }} />
                    </div>
                </div>
            </section>

            <section>
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_415px] gap-5 items-stretch">
                    <div>
                        <h2 className="text-[16px] font-bold text-[#4F3529] mb-3">
                            Inventory Highlights
                        </h2>

                        <div className="space-y-2">
                            <div className="bg-white rounded-[14px] border border-[#D9D9D9] px-4 py-3 flex items-center justify-between min-h-[60px] shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#D9D9D9] flex items-center justify-center text-[#2F9EEB]">
                                        <ShoppingBag className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-[#4F3529] text-[12px]">
                                        Total Items Sold
                                    </span>
                                </div>

                                <span className="px-3 py-1 rounded-full bg-[#FFF1B8] text-[#8A6B00] text-[11px] font-bold">
                                    {report?.totalItemsSold || 0} Pcs
                                </span>
                            </div>

                            <div className="bg-white rounded-[14px] border border-[#D9D9D9] px-4 py-3 flex items-center justify-between min-h-[60px] shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#D9D9D9] flex items-center justify-center text-[#C57A2F]">
                                        <Trophy className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-[#4F3529] text-[12px]">
                                        Top Selling Product
                                    </span>
                                </div>

                                <span className="font-bold text-[#4F3529] text-[12px] text-right">
                                    {report?.topSellingProduct || '-'}
                                </span>
                            </div>

                            <div className="bg-white rounded-[14px] border border-[#D9D9D9] px-4 py-3 flex items-center justify-between min-h-[60px] shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#F8F8F8] border border-[#D9D9D9] flex items-center justify-center text-[#FF5167]">
                                        <Flag className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-[#4F3529] text-[12px]">
                                        Guide Commissions
                                    </span>
                                </div>

                                <span className="px-3 py-1 rounded-full bg-[#FFE1C4] text-[#E06F00] text-[11px] font-bold">
                                    {formatRupiah(report?.guideCommission || 0)}
                                </span>
                            </div>

                            <textarea
                                value={cashierNotes}
                                onChange={(e) => setCashierNotes(e.target.value)}
                                placeholder="Cashier notes (e.g., missing coins, canceled invoices)..."
                                disabled={isRegisterClosed}
                                className="w-full rounded-[28px] border border-[#D9D9D9] bg-white px-6 py-5 min-h-[68px] outline-none focus:ring-2 focus:ring-[#6A4734] resize-y text-xs text-[#4F3529] shadow-sm disabled:bg-[#F5F5F5]"
                            />
                        </div>
                    </div>

                    <div className="bg-[#6A4734] rounded-[28px] p-6 text-white flex flex-col min-h-[315px] shadow-[0_12px_18px_rgba(86,57,43,0.28)]">
                        <h2 className="text-lg font-bold mb-1">
                            Payment Breakdown
                        </h2>

                        <p className="uppercase tracking-[1px] font-bold" style={{ fontSize: '11px', opacity: 0.8, marginBottom: '24px' }}>
                            Transaction Methods
                        </p>

                        <div className="flex items-start gap-7">
                            <div
                                className="relative shrink-0 rounded-full flex items-center justify-center"
                                style={{
                                    width: '96px',
                                    height: '96px',
                                    marginRight: '24px',
                                    background: `conic-gradient(#FF3CAE 0 ${chartStops.cashEnd}%, #2D9BFF ${chartStops.cashEnd}% ${chartStops.qrisEnd}%, #12D981 ${chartStops.qrisEnd}% 100%)`
                                }}
                            >
                                <div className="w-[48px] h-[48px] rounded-full bg-[#56392B] flex flex-col items-center justify-center text-center px-1">
                                    <span className="uppercase font-bold leading-none tracking-[1px]" style={{ fontSize: '9px', opacity: 0.8 }}>
                                        Total
                                    </span>
                                    <span className="font-bold mt-1 leading-tight" style={{ fontSize: '14px' }}>
                                        {formatRupiahCompact(totalPaymentBreakdown)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 text-sm pt-1">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full" style={{ width: '10px', height: '10px', backgroundColor: '#FF3CAE' }} />
                                        <span className="text-[11px] font-semibold">Cash</span>
                                    </div>
                                    <span className="text-[11px] font-bold">
                                        {formatRupiahCompact(cashAmount)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full" style={{ width: '10px', height: '10px', backgroundColor: '#2D9BFF' }} />
                                        <span className="text-[11px] font-semibold">QRIS</span>
                                    </div>
                                    <span className="text-[11px] font-bold">
                                        {formatRupiahCompact(qrisAmount)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full" style={{ width: '10px', height: '10px', backgroundColor: '#12D981' }} />
                                        <span className="text-[11px] font-semibold">Debit</span>
                                    </div>
                                    <span className="text-[11px] font-bold">
                                        {formatRupiahCompact(cardAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isRegisterClosed ? (
                            <>
                                <div className="mt-auto w-full h-[36px] rounded-xl bg-[#7B5947] text-white text-[12px] font-extrabold tracking-[1px] flex items-center justify-center">
                                    REGISTER CLOSED
                                </div>

                                <button
                                    type="button"
                                    onClick={handleDownloadPdfReport}
                                    className="mt-3 w-full rounded-xl bg-white font-extrabold text-[12px] tracking-[1px] hover:opacity-90 transition flex items-center justify-center gap-2"
                                    style={{
                                        height: '36px',
                                        color: '#6A4734'
                                    }}
                                >
                                    <Download className="w-4 h-4" />
                                    DOWNLOAD PDF REPORT
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={handleCloseRegister}
                                disabled={closing}
                                className="mt-auto w-full rounded-xl bg-white font-extrabold text-[12px] tracking-[1px] hover:opacity-90 transition disabled:opacity-60"
                                style={{
                                    height: '36px',
                                    color: '#6A4734'
                                }}
                            >
                                {closing ? 'PROCESSING...' : 'SUBMIT & CLOSE REGISTER'}
                            </button>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TransactionPage;