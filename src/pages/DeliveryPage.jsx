import React, { useMemo, useRef, useState } from 'react';
import {
    User,
    LogOut,
    PackageCheck,
    Truck,
    CalendarClock,
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STORE_PROFIT_PERCENT = 15;

const formatRupiah = (value) => {
    return `Rp.${Number(value || 0).toLocaleString('id-ID')}`;
};

const formatDateTimeValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatScheduleText = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) + ' WITA';
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'scheduled':
            return 'Scheduled';
        case 'to_be_scheduled':
        default:
            return 'To be scheduled';
    }
};

const getStatusBadgeClass = (status) => {
    if (status === 'scheduled') {
        return 'bg-[#EAF8EA] text-[#56B95A]';
    }

    return 'bg-[#FFF1F1] text-[#FF4D4F]';
};

const initialDeliveryOrders = [
    {
        _id: '1',
        receiptNumber: 'RCPT-20260405-0002',
        itemName: 'Big Garuda Statue',
        customerName: 'Yoga Kusuma',
        deliveryFee: 1015000,
        delivery: {
            packageName: 'Big Garuda Statue',
            recipientName: '',
            destinationAddress: '',
            courierPartner: '',
            pickupDateTime: '',
            packageWeight: '',
            courierPrice: 882608.7,
            storeProfit: 132391.3,
            totalPrice: 1015000,
            trackingNumber: '',
            notes: '',
            status: 'to_be_scheduled'
        }
    },
    {
        _id: '2',
        receiptNumber: 'RCPT-20260405-0003',
        itemName: 'Barong Mask',
        customerName: 'Yoga Kusuma',
        deliveryFee: 1015000,
        delivery: {
            packageName: 'Barong Mask',
            recipientName: 'Yoga Kusuma',
            destinationAddress: 'Jl. Raya Ubud No. 18, Gianyar, Bali',
            courierPartner: 'J&T Cargo',
            pickupDateTime: '2026-04-24T10:00:00',
            packageWeight: '8 kg',
            courierPrice: 882608.7,
            storeProfit: 132391.3,
            totalPrice: 1015000,
            trackingNumber: 'JT202604240001',
            notes: 'Handle with care',
            status: 'scheduled'
        }
    }
];

const DeliveryPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const userMenuRef = useRef(null);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');
    const [orders, setOrders] = useState(initialDeliveryOrders);
    const [selectedOrderId, setSelectedOrderId] = useState(initialDeliveryOrders[0]?._id || null);

    const selectedOrder = useMemo(() => {
        return orders.find((order) => order._id === selectedOrderId) || null;
    }, [orders, selectedOrderId]);

    const [form, setForm] = useState({
        recipientName: '',
        destinationAddress: '',
        courierPartner: '',
        pickupDateTime: '',
        packageWeight: '',
        courierPrice: '',
        trackingNumber: '',
        notes: ''
    });

    React.useEffect(() => {
        if (!selectedOrder) return;

        setForm({
            recipientName: selectedOrder.delivery?.recipientName || selectedOrder.customerName || '',
            destinationAddress: selectedOrder.delivery?.destinationAddress || '',
            courierPartner: selectedOrder.delivery?.courierPartner || '',
            pickupDateTime: formatDateTimeValue(selectedOrder.delivery?.pickupDateTime),
            packageWeight: selectedOrder.delivery?.packageWeight || '',
            courierPrice: selectedOrder.delivery?.courierPrice
                ? String(Math.round(selectedOrder.delivery.courierPrice))
                : '',
            trackingNumber: selectedOrder.delivery?.trackingNumber || '',
            notes: selectedOrder.delivery?.notes || ''
        });
    }, [selectedOrder]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const status = order.delivery?.status || 'to_be_scheduled';

            const matchesTab =
                tab === 'all'
                    ? true
                    : tab === 'to_be_scheduled'
                        ? status === 'to_be_scheduled'
                        : status === 'scheduled';

            const keyword = search.trim().toLowerCase();
            const matchesSearch =
                !keyword ||
                order.itemName.toLowerCase().includes(keyword) ||
                order.customerName.toLowerCase().includes(keyword) ||
                order.receiptNumber.toLowerCase().includes(keyword);

            return matchesTab && matchesSearch;
        });
    }, [orders, tab, search]);

    const shippingRevenue = useMemo(() => {
        return orders.reduce((sum, order) => sum + Number(order.delivery?.totalPrice || order.deliveryFee || 0), 0);
    }, [orders]);

    const shippingProfit = useMemo(() => {
        return orders.reduce((sum, order) => sum + Number(order.delivery?.storeProfit || 0), 0);
    }, [orders]);

    const courierPriceNumber = Number(form.courierPrice || 0);
    const storeProfit = courierPriceNumber * (STORE_PROFIT_PERCENT / 100);
    const totalPrice = courierPriceNumber + storeProfit;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSelectOrder = (order) => {
        setSelectedOrderId(order._id);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: name === 'courierPrice' ? value.replace(/[^\d]/g, '') : value
        }));
    };

    const handleSetSchedule = () => {
        if (!selectedOrder) return;

        const recipientName = form.recipientName.trim();
        const destinationAddress = form.destinationAddress.trim();
        const courierPartner = form.courierPartner.trim();
        const pickupDateTime = form.pickupDateTime;
        const packageWeight = form.packageWeight.trim();
        const trackingNumber = form.trackingNumber.trim();
        const notes = form.notes.trim();

        if (!recipientName) {
            alert('Recipient name is required');
            return;
        }

        if (!destinationAddress) {
            alert('Destination address is required');
            return;
        }

        if (!courierPartner) {
            alert('Courier partner is required');
            return;
        }

        if (!pickupDateTime) {
            alert('Pickup date and time is required');
            return;
        }

        if (!packageWeight) {
            alert('Package weight is required');
            return;
        }

        if (!courierPriceNumber || courierPriceNumber < 0) {
            alert('Courier price is required');
            return;
        }

        setOrders((prev) =>
            prev.map((order) => {
                if (order._id !== selectedOrder._id) return order;

                return {
                    ...order,
                    deliveryFee: totalPrice,
                    delivery: {
                        ...order.delivery,
                        packageName: order.delivery?.packageName || order.itemName,
                        recipientName,
                        destinationAddress,
                        courierPartner,
                        pickupDateTime,
                        packageWeight,
                        courierPrice: courierPriceNumber,
                        storeProfit,
                        totalPrice,
                        trackingNumber,
                        notes,
                        status: 'scheduled'
                    }
                };
            })
        );

        alert('Delivery schedule saved in form');
    };

    return (
        <div className="w-full">
            <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                    <h1 className="text-[24px] font-bold text-[#5A3B2D]">
                        Delivery Management
                    </h1>
                    <p className="text-sm text-[#7C6B62] mt-1">
                        Processing paid shipments with 15% service
                    </p>
                </div>

                <div className="flex items-start gap-4">
                    <div className="bg-[#F5F5F5] rounded-[28px] px-6 py-7 shadow-sm min-w-[210px]">
                        <p className="text-[18px] font-semibold text-[#5A3B2D] mb-2">
                            Shipping Revenue
                        </p>
                        <h2 className="text-[24px] font-bold text-[#5A3B2D]">
                            {formatRupiah(shippingRevenue)}
                        </h2>
                    </div>

                    <div className="bg-[#6A4734] rounded-[28px] px-6 py-7 shadow-sm min-w-[210px]">
                        <p className="text-[18px] font-semibold text-white mb-2">
                            Shipping Profit
                        </p>
                        <h2 className="text-[24px] font-bold text-white">
                            {formatRupiah(shippingProfit)}
                        </h2>
                    </div>

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

            <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-6">
                {/* LEFT */}
                <section>
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="bg-[#F1F1F1] rounded-full p-1 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setTab('all')}
                                className={`px-8 py-3 rounded-full text-sm font-semibold transition ${
                                    tab === 'all'
                                        ? 'bg-white text-[#1F1F1F] shadow-sm'
                                        : 'text-[#9A9A9A]'
                                }`}
                            >
                                ALL DATA
                            </button>

                            <button
                                type="button"
                                onClick={() => setTab('to_be_scheduled')}
                                className={`px-8 py-3 rounded-full text-sm font-semibold transition ${
                                    tab === 'to_be_scheduled'
                                        ? 'bg-white text-[#1F1F1F] shadow-sm'
                                        : 'text-[#9A9A9A]'
                                }`}
                            >
                                TO BE SCHEDULED
                            </button>

                            <button
                                type="button"
                                onClick={() => setTab('scheduled')}
                                className={`px-8 py-3 rounded-full text-sm font-semibold transition ${
                                    tab === 'scheduled'
                                        ? 'bg-white text-[#1F1F1F] shadow-sm'
                                        : 'text-[#9A9A9A]'
                                }`}
                            >
                                SCHEDULED
                            </button>
                        </div>

                        <div className="relative w-full max-w-[280px]">
                            <input
                                type="text"
                                placeholder="Search receipt or product"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#6A4734]"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const status = order.delivery?.status || 'to_be_scheduled';
                            const isActive = selectedOrderId === order._id;

                            return (
                                <button
                                    key={order._id}
                                    type="button"
                                    onClick={() => handleSelectOrder(order)}
                                    className={`w-full text-left rounded-[34px] border bg-white shadow-sm transition overflow-hidden ${
                                        isActive
                                            ? 'border-[#D4C7BE] ring-2 ring-[#6A4734]/20'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="grid grid-cols-[10px_1fr]">
                                        <div className="bg-[#6A4734]" />

                                        <div className="p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-xs text-[#B0A29A] font-semibold">
                                                        Receipt No #{order.receiptNumber}
                                                    </p>
                                                    <h3 className="text-[18px] font-bold text-[#5A3B2D] mt-1">
                                                        {order.itemName}
                                                    </h3>
                                                    <p className="text-sm text-[#A08F85] mt-1">
                                                        {order.customerName}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(status)}`}>
                                                        {getStatusLabel(status)}
                                                    </div>
                                                    <h4 className="text-[18px] font-bold text-[#5A3B2D] mt-3">
                                                        {formatRupiah(order.delivery?.totalPrice || order.deliveryFee || 0)}
                                                    </h4>
                                                    <p className="text-sm text-[#A08F85]">
                                                        Paid in POS
                                                    </p>
                                                </div>
                                            </div>

                                            {status === 'scheduled' && (
                                                <div className="mt-5 rounded-[22px] border border-dashed border-[#D8D8D8] px-5 py-4 grid grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <Truck className="w-4 h-4 text-[#B59A8A]" />
                                                        <div>
                                                            <p className="text-[10px] tracking-[2px] font-bold text-[#B0A29A] uppercase">
                                                                Courier
                                                            </p>
                                                            <p className="text-sm font-semibold text-[#5A3B2D]">
                                                                {order.delivery?.courierPartner || '-'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <CalendarClock className="w-4 h-4 text-[#B59A8A]" />
                                                        <div>
                                                            <p className="text-[10px] tracking-[2px] font-bold text-[#B0A29A] uppercase">
                                                                Estimated Arrival
                                                            </p>
                                                            <p className="text-sm font-semibold text-[#5A3B2D]">
                                                                {formatScheduleText(order.delivery?.pickupDateTime)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        {filteredOrders.length === 0 && (
                            <div className="rounded-3xl bg-[#F8F8F8] border border-gray-200 p-8 text-center text-gray-500">
                                No delivery data found
                            </div>
                        )}
                    </div>
                </section>

                {/* RIGHT */}
                <aside className="bg-[#F5F5F5] rounded-[28px] p-6 shadow-sm h-fit">
                    <h2 className="text-[18px] font-bold text-[#5A3B2D] mb-5">
                        Package Information
                    </h2>

                    {selectedOrder ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-[#7D6E66] mb-2">
                                    Recipient Name
                                </label>
                                <input
                                    type="text"
                                    name="recipientName"
                                    value={form.recipientName}
                                    onChange={handleChange}
                                    className="w-full h-[46px] rounded-xl border border-gray-200 bg-white shadow-sm px-4 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#7D6E66] mb-2">
                                    Destination Address
                                </label>
                                <textarea
                                    name="destinationAddress"
                                    value={form.destinationAddress}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734] resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#7D6E66] mb-2">
                                    Select Courier Partner
                                </label>
                                <input
                                    type="text"
                                    name="courierPartner"
                                    value={form.courierPartner}
                                    onChange={handleChange}
                                    placeholder="Example: J&T Cargo"
                                    className="w-full h-[46px] rounded-xl border border-gray-200 bg-white shadow-sm px-4 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#7D6E66] mb-2">
                                    Pickup date and Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="pickupDateTime"
                                    value={form.pickupDateTime}
                                    onChange={handleChange}
                                    className="w-full h-[46px] rounded-xl border border-gray-200 bg-white shadow-sm px-4 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#7D6E66] mb-2">
                                    Package Weight
                                </label>
                                <input
                                    type="text"
                                    name="packageWeight"
                                    value={form.packageWeight}
                                    onChange={handleChange}
                                    placeholder="Example: 8 kg"
                                    className="w-full h-[46px] rounded-xl border border-gray-200 bg-white shadow-sm px-4 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#7D6E66] mb-2">
                                        Courier Price
                                    </label>
                                    <input
                                        type="text"
                                        name="courierPrice"
                                        value={form.courierPrice}
                                        onChange={handleChange}
                                        className="w-full h-[46px] rounded-xl border border-gray-200 bg-white shadow-sm px-4 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[#7D6E66] mb-2">
                                        Store Profit ({STORE_PROFIT_PERCENT}%)
                                    </label>
                                    <input
                                        type="text"
                                        value={formatRupiah(storeProfit)}
                                        readOnly
                                        className="w-full h-[46px] rounded-xl border border-gray-200 bg-[#FAFAFA] shadow-sm px-4 text-gray-600 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[#7D6E66] mb-2">
                                    Tracking Number / Nomor Resi
                                </label>
                                <input
                                    type="text"
                                    name="trackingNumber"
                                    value={form.trackingNumber}
                                    onChange={handleChange}
                                    placeholder="Input nomor resi jika sudah ada"
                                    className="w-full h-[46px] rounded-xl border border-gray-200 bg-white shadow-sm px-4 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#7D6E66] mb-2">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Additional notes"
                                    className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734] resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#7D6E66] mb-2">
                                    Total Price
                                </label>
                                <input
                                    type="text"
                                    value={formatRupiah(totalPrice)}
                                    readOnly
                                    className="w-full h-[46px] rounded-xl border border-gray-200 bg-[#FAFAFA] shadow-sm px-4 text-gray-600 outline-none"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleSetSchedule}
                                className="w-full h-[48px] rounded-xl bg-[#6A4734] text-white font-semibold hover:opacity-90 transition"
                            >
                                Set Schedule
                            </button>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm">
                            Select delivery card first
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default DeliveryPage;