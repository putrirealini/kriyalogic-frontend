import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft,
    User,
    Wallet,
    CreditCard,
    QrCode,
    Image as ImageIcon,
    PlusCircle,
    LogOut,
    ClipboardList
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useCheckout from '../hooks/useCheckout';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import logoImage from '../../public/logo.png';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

const formatRupiah = (value) => {
    return `Rp. ${Number(value || 0).toLocaleString('id-ID')}`;
};

const TAX_PERCENT = 5;

const OrderPaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { logout, user } = useAuth();
    const receiptPdfRef = useRef(null);
    const [receiptPopup, setReceiptPopup] = useState(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const orderState = location.state || {};
    const orderItems = Array.isArray(orderState.items) ? orderState.items : [];
    const selectedGuide = orderState.selectedGuide || null;
    const guideCommissionAmount = Number(orderState.guideCommissionAmount || 0);

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerNameError, setCustomerNameError] = useState('');
    const [customerPhoneError, setCustomerPhoneError] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
        orderState.paymentMethod || 'qris'
    );
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [paidAmountInput, setPaidAmountInput] = useState('');
    const isCashPayment = selectedPaymentMethod === 'cash';

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

    const { checkout, loading: isSubmitting, error: checkoutError, setError: alert } = useCheckout();

    const subtotal = useMemo(() => {
        if (orderState.subtotal !== undefined) {
            return Number(orderState.subtotal || 0);
        }

        return orderItems.reduce((acc, item) => acc + Number(item.price || 0), 0);
    }, [orderItems, orderState.subtotal]);

    const taxAmount = useMemo(() => {
        return (subtotal * TAX_PERCENT) / 100;
    }, [subtotal]);

    const totalAmount = useMemo(() => {
        return (
            subtotal +
            taxAmount +
            Number(deliveryFee || 0) -
            Number(discount || 0) +
            Number(guideCommissionAmount || 0)
        );
    }, [subtotal, taxAmount, deliveryFee, discount, guideCommissionAmount]);

    useEffect(() => {
        if (!isCashPayment) {
            setPaidAmountInput(String(totalAmount));
        }
    }, [isCashPayment, totalAmount]);

    const paidAmount = useMemo(() => {
        if (!isCashPayment) return totalAmount;
        return Number(paidAmountInput || 0);
    }, [isCashPayment, paidAmountInput, totalAmount]);

    const changeAmount = useMemo(() => {
        if (!isCashPayment) return 0;
        const change = paidAmount - totalAmount;
        return change > 0 ? change : 0;
    }, [isCashPayment, paidAmount, totalAmount]);

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

    const handleGoToReceiptHistories = () => {
        navigate('/dashboard/pos/receipt-histories');
    };

    const handleBack = () => {
        navigate('/dashboard/pos');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleAppendKeypad = (value) => {
        if (!isCashPayment) return;

        if (value === '.') {
            if (paidAmountInput.includes('.')) return;
            setPaidAmountInput((prev) => (prev ? `${prev}.` : '0.'));
            return;
        }

        setPaidAmountInput((prev) => {
            if (prev === '0') return String(value);
            return `${prev}${value}`;
        });
    };

    const handleClearPaidAmount = () => {
        if (!isCashPayment) return;
        setPaidAmountInput('');
    };

    const handleBackspacePaidAmount = () => {
        if (!isCashPayment) return;
        setPaidAmountInput((prev) => prev.slice(0, -1));
    };

    const handleAddDelivery = () => {
        const input = window.prompt('Input delivery fee', deliveryFee || 0);
        if (input === null) return;

        const numericValue = Number(String(input).replace(/,/g, '').trim());
        if (Number.isNaN(numericValue) || numericValue < 0) return;

        setDeliveryFee(numericValue);
    };

    const handleAddDiscount = () => {
        const input = window.prompt('Input discount amount', discount || 0);
        if (input === null) return;

        const numericValue = Number(String(input).replace(/,/g, '').trim());
        if (Number.isNaN(numericValue) || numericValue < 0) return;

        setDiscount(numericValue);
    };

    const handlePayNow = async () => {
        const trimmedCustomerName = customerName.trim();
        const trimmedCustomerPhone = customerPhone.trim();

        if (!customerName.trim()) {
            setCustomerNameError('Customer name is required');
        } else {
            setCustomerNameError('');
        }

        if (!customerPhone.trim()) {
            setCustomerPhoneError('Customer phone number is required');
        } else {
            setCustomerPhoneError('');
        }

        if (!orderItems || orderItems.length === 0) {
            toast.error('Order items cannot be empty');
        }

        if (!selectedPaymentMethod) {
            toast.error('Please select a payment method');
        }

        if (!customerName.trim() || !customerPhone.trim() || !orderItems.length || !selectedPaymentMethod) {
            return;
        }

        const totalAmount = orderItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0) + Number(deliveryFee || 0) - Number(discount || 0);

        if (selectedPaymentMethod === 'cash' && Number(paidAmount || 0) < totalAmount) {
            toast.error('Amount paid is less than total payment');
            return;
        }

        const payload = {
            customerName: trimmedCustomerName,
            customerPhone: trimmedCustomerPhone,
            paymentMethod: selectedPaymentMethod,
            itemIds: orderItems.map((item) => item.id),
            guideId: selectedGuide?.id || null,
            deliveryFee: Number(deliveryFee || 0),
            discount: Number(discount || 0),
            amountPaid: Number(paidAmount || 0)
        };

        try {
            const result = await checkout(payload);

            if (!result.success) {
                toast.error(result.error || 'Failed to process payment');
                return;
            }

            setReceiptPopup(result.data);
        } catch (error) {
            toast.error('Something went wrong while processing payment');
        }
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

            const pageWidth = 80; // receipt thermal
            const margin = 4;
            const contentWidth = pageWidth - margin * 2;
            const contentHeight = (canvas.height * contentWidth) / canvas.width;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [pageWidth, contentHeight + margin * 2]
            });

            pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
            pdf.save(`receipt-${receiptPopup?.receiptNumber || 'transaction'}.pdf`);
        } catch (error) {
            toast.error('Failed to generate receipt PDF');
        }
    };

    if (!orderItems.length) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] px-8 py-8">
                <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 p-10 text-center">
                    <h1 className="text-2xl font-bold text-[#5A3B2D] mb-4">
                        No Order Selected
                    </h1>
                    <p className="text-gray-500 mb-6">
                        Please select product(s) from POS first.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/pos')}
                        className="w-10 h-10 rounded-full bg-[#6A4734] text-white flex items-center justify-center hover:opacity-90"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

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
                        Order Payment
                    </h1>
                </div>

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

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
                {/* LEFT */}
                <section className="bg-[#EAEAEA] rounded-3xl p-8 min-h-[760px] flex flex-col">
                    <div className="mb-8">
                        <h2 className="text-[16px] font-semibold text-[#5A3B2D] mb-4">
                            Customer Detail
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col">
                                <input
                                    type="text"
                                    placeholder="Add Name"
                                    value={customerName}
                                    required
                                    onChange={(e) =>{
                                        setCustomerName(e.target.value)
                                        setCustomerNameError('');
                                    }}
                                    className="h-12 rounded-xl border border-[#B9ACA0] bg-[#F8F8F8] px-4 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                />
                                {customerNameError && (
                                    <small className="text-sm text-red-600 mt-1">
                                        Customer name is required
                                    </small>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <input
                                    type="text"
                                    placeholder="Add Phone Number"
                                    value={customerPhone}
                                    required
                                    onChange={(e) => {
                                        setCustomerPhone(e.target.value);
                                        setCustomerPhoneError('');
                                    }}
                                    className="h-12 rounded-xl border border-[#B9ACA0] bg-[#F8F8F8] px-4 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                />
                                {customerPhoneError && (
                                    <small className="text-sm text-red-600 mt-1">
                                        Phone number is required
                                    </small>
                                )}
                            </div>

                        </div>
                    </div>

                    <div>
                        <h2 className="text-[16px] font-semibold text-[#5A3B2D] mb-4">
                            Transaction Detail
                        </h2>

                        <div className="space-y-3">
                            {orderItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-[72px_1fr_120px] items-center gap-4 bg-[#F8F8F8] rounded-2xl px-3 py-3"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#E3E3E3] overflow-hidden flex items-center justify-center">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>

                                    <div className="text-sm text-[#3A2C25] font-medium truncate">
                                        {item.name}
                                    </div>

                                    <div className="text-sm text-[#3A2C25] text-right font-medium">
                                        {formatRupiah(item.price)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-12 flex flex-col items-center">
                        <div className="w-full max-w-[520px] flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={handleAddDelivery}
                                className="w-full h-12 rounded-xl border border-[#B9ACA0] bg-[#F8F8F8] text-[#6A5B50] text-sm flex items-center justify-center gap-2 hover:bg-white"
                            >
                                <PlusCircle className="w-4 h-4 text-gray-400" />
                                Add Delivery
                            </button>

                            <button
                                type="button"
                                onClick={handleAddDiscount}
                                className="w-full h-12 rounded-xl border border-[#B9ACA0] bg-[#F8F8F8] text-[#6A5B50] text-sm flex items-center justify-center gap-2 hover:bg-white"
                            >
                                <PlusCircle className="w-4 h-4 text-gray-400" />
                                Add promotion or discount
                            </button>

                            <div className="mt-2 bg-[#F8F8F8] rounded-2xl p-6 w-full">
                                <div className="space-y-2 text-sm text-[#3A2C25]">
                                    <div className="flex items-center justify-between">
                                        <span>Sub Total</span>
                                        <span>{formatRupiah(subtotal)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span>tax {TAX_PERCENT}%</span>
                                        <span>{formatRupiah(taxAmount)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span>delivery fee</span>
                                        <span>{deliveryFee ? formatRupiah(deliveryFee) : '-'}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span>discount</span>
                                        <span>{discount ? formatRupiah(discount) : '-'}</span>
                                    </div>

                                    {selectedGuide && (
                                        <div className="flex items-center justify-between">
                                            <span>
                                                guide commission ({selectedGuide.commissionRate}%)
                                            </span>
                                            <span>{formatRupiah(guideCommissionAmount)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-300 my-4" />

                                <div className="flex items-center justify-between">
                                    <span className="text-[28px] font-bold text-[#1F1F1F]">
                                        Total Amount
                                    </span>
                                    <span className="text-[28px] font-bold text-[#1F1F1F]">
                                        {formatRupiah(totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* RIGHT */}
                <aside className="flex flex-col">
                    <div className="grid grid-cols-3 gap-4 mb-16">
                        {paymentMethods.map((method) => {
                            const active = selectedPaymentMethod === method.key;

                            return (
                                <button
                                    key={method.key}
                                    type="button"
                                    onClick={() => setSelectedPaymentMethod(method.key)}
                                    className="flex flex-col items-center gap-3"
                                >
                                    <div
                                        className={`w-full h-[52px] rounded-xl border flex items-center justify-center transition ${
                                            active
                                                ? 'bg-[#6A4734] border-[#6A4734] text-white'
                                                : 'bg-[#F8F8F8] border-[#8D7768] text-[#6A4734]'
                                        }`}
                                    >
                                        {method.icon}
                                    </div>
                                    <span className="text-[12px] font-semibold text-[#5A3B2D] text-center">
                                        {method.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="text-center mb-10">
                        <p className="text-[18px] font-semibold text-[#6A4E40] mb-3">
                            Amount to Pay
                        </p>
                        <h2 className="text-5xl leading-none font-bold text-[#1F1F1F]">
                            {formatRupiah(totalAmount)}
                        </h2>
                    </div>

                    {isCashPayment ? (
                        <>
                            <div className="mb-6 text-center">
                                <p className="text-sm text-[#6A4E40] mb-2">Paid Amount</p>
                                <div className="min-h-[56px] rounded-2xl bg-white border border-gray-200 px-4 flex items-center justify-center text-[28px] font-bold text-[#1F1F1F]">
                                    {paidAmountInput ? formatRupiah(paidAmount) : 'Rp. 0'}
                                </div>

                                {changeAmount > 0 && (
                                    <p className="mt-3 text-sm font-medium text-green-600">
                                        Change: {formatRupiah(changeAmount)}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-y-8 gap-x-10 justify-items-center mb-10 text-[24px] font-bold text-[#1F1F1F]">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleAppendKeypad(key)}
                                        className="w-14 h-14 rounded-full hover:bg-white transition"
                                    >
                                        {key}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleBackspacePaidAmount}
                                    className="w-14 h-14 rounded-full hover:bg-white transition text-lg"
                                >
                                    ⌫
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <button
                                    type="button"
                                    onClick={handleClearPaidAmount}
                                    className="h-12 rounded-xl border border-gray-300 bg-white text-[#6A4734] font-semibold hover:bg-gray-50"
                                >
                                    Clear
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaidAmountInput(String(totalAmount))}
                                    className="h-12 rounded-xl border border-gray-300 bg-white text-[#6A4734] font-semibold hover:bg-gray-50"
                                >
                                    Exact
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="mb-10 text-center">
                            <p className="text-sm text-[#6A4E40] mb-2">Paid Amount</p>
                            <div className="min-h-[56px] rounded-2xl bg-white border border-gray-200 px-4 flex items-center justify-center text-[28px] font-bold text-[#1F1F1F]">
                                {formatRupiah(totalAmount)}
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handlePayNow}
                        disabled={isSubmitting}
                        className="w-full h-[58px] rounded-2xl bg-[#6A4734] text-white text-[24px] font-bold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Processing...' : 'Pay Now'}
                    </button>
                </aside>
            </div>

            {receiptPopup && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl relative p-4 sm:p-5 max-h-[100vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setReceiptPopup(null);
                                navigate('/dashboard/pos');
                            }}
                            className="absolute top-3 right-4 text-[#5A3B2D] hover:opacity-70 text-2xl font-bold print:hidden"
                        >
                            ×
                        </button>

                        <div
                            ref={receiptPdfRef}
                            className="mx-auto w-full max-w-[300px] bg-white text-[#4E3629] p-4 rounded-none shadow-none"
                            style={{
                                fontFamily: 'Arial, sans-serif',
                                lineHeight: 1.4,
                            }}
                        >
                            {/* Header */}
                            <div className="text-center border-b border-dashed border-[#D9D9D9] pb-3 mb-3">
                                <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                                    <img
                                        src={logoImage}
                                        alt="KriyaLogic Logo"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>

                                <h2 className="text-lg font-bold text-[#5A3B2D] leading-tight">
                                    KriyaLogic
                                </h2>

                                <p className="text-[10px] text-[#6B4C3B] mt-1">
                                    Empowering Craftsmanship with Digital Logic
                                </p>

                                <p className="text-[10px] text-[#6B4C3B] mt-2">
                                    Jl. Ir. Sutami, Kemenuh, Kec. Sukawati, Kabupaten Gianyar, Bali
                                </p>
                            </div>

                            {/* Meta */}
                            <div className="text-[11px] text-[#4E3629] space-y-1 border-b border-dashed border-[#D9D9D9] pb-3 mb-3">
                                <div className="flex justify-between gap-3">
                                    <span className="font-medium">Receipt No</span>
                                    <span className="text-right">#{receiptPopup.receiptNumber}</span>
                                </div>

                                <div className="flex justify-between gap-3">
                                    <span className="font-medium">Date</span>
                                    <span className="text-right">
                                        {new Date(receiptPopup.paidAt).toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-3">
                                    <span className="font-medium">Cashier</span>
                                    <span className="text-right">{receiptPopup.cashierName || '-'}</span>
                                </div>

                                <div className="flex justify-between gap-3">
                                    <span className="font-medium">Customer</span>
                                    <span className="text-right">{receiptPopup.customerName || '-'}</span>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="mb-3">
                                <h3 className="text-[12px] font-bold text-[#5A3B2D] mb-2">
                                    Payment Details
                                </h3>

                                <div className="border-y border-dashed border-[#D9D9D9] py-2">
                                    <div className="grid grid-cols-[1fr_35px_80px] gap-2 text-[10px] font-bold mb-2">
                                        <div>Item</div>
                                        <div className="text-center">Qty</div>
                                        <div className="text-right">Total</div>
                                    </div>

                                    <div className="space-y-2">
                                        {receiptPopup.items.map((item, index) => (
                                            <div
                                                key={item.productItemId || index}
                                                className="grid grid-cols-[1fr_35px_80px] gap-2 text-[10px]"
                                            >
                                                <div className="break-words">
                                                    {item.itemName}
                                                </div>
                                                <div className="text-center">
                                                    {item.qty}
                                                </div>
                                                <div className="text-right font-semibold">
                                                    {formatRupiah(
                                                        Number(item.price || 0) * Number(item.qty || 0)
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Transaction details */}
                            <div className="mb-3">
                                <h3 className="text-[12px] font-bold text-[#5A3B2D] mb-2">
                                    Transaction Details
                                </h3>

                                <div className="space-y-1 text-[10px]">
                                    <div className="flex justify-between gap-3">
                                        <span>Amount paid</span>
                                        <span className="text-right">{formatRupiah(receiptPopup.amountPaid)}</span>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <span>Change</span>
                                        <span className="text-right">{formatRupiah(receiptPopup.changeAmount)}</span>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <span>Payment method</span>
                                        <span className="text-right capitalize">{receiptPopup.paymentMethod}</span>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <span>Guide commission</span>
                                        <span className="text-right">
                                            {formatRupiah(receiptPopup.guideCommissionAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center border-t border-dashed border-[#D9D9D9] pt-3 mt-3">
                                <h2 className="text-base font-bold text-[#5A3B2D]">
                                    Have a Nice Day!
                                </h2>

                                <p className="text-[10px] text-[#6B4C3B] mt-1">
                                    No return or exchange accepted without receipt
                                </p>

                                <div className="mt-3 text-[10px] text-[#6B4C3B] space-y-1">
                                    <p className="font-semibold text-[#5A3B2D]">Get in touch</p>
                                    <p>@wahanagiri</p>
                                    <p>+62001234567</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-5 print:hidden">
                            <button
                                type="button"
                                onClick={() => {
                                    setReceiptPopup(null);
                                    navigate('/dashboard/pos');
                                }}
                                className="h-11 rounded-xl bg-[#6A4734] text-white text-sm font-bold hover:opacity-90"
                            >
                                Back to POS
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadReceiptPdf}
                                className="h-11 rounded-xl bg-[#6A4734] text-white text-sm font-bold hover:opacity-90"
                            >
                                Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderPaymentPage;