import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ChevronDown,
    PlusCircle,
    User,
    Search,
    Truck,
    CalendarClock
} from 'lucide-react';
import toast from 'react-hot-toast';
import useDeliveryOrders from '../hooks/useDeliveryOrders';
import useDeliveryCouriers from '../hooks/useDeliveryCouriers';
import useUpdateDeliverySchedule from '../hooks/useUpdateDeliverySchedule';

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
    return status === 'scheduled' ? 'Scheduled' : 'To be scheduled';
};

const getStatusBadgeClass = (status) => {
    return status === 'scheduled'
        ? 'bg-[#EAF8EA] text-[#56B95A]'
        : 'bg-[#FFF1F1] text-[#FF4D4F]';
};

const EMPTY_DELIVERY_FORM = {
    recipientName: '',
    destinationAddress: '',
    courierPartner: '',
    pickupDateTime: '',
    packageWeight: '',
    courierPrice: '',
    trackingNumber: '',
    notes: ''
};

const buildDeliveryForm = (order) => {
    if (!order) return EMPTY_DELIVERY_FORM;

    const delivery = order.delivery || {};

    return {
        recipientName: delivery.recipientName || order.customerName || '',
        destinationAddress: delivery.destinationAddress || '',
        courierPartner: delivery.courierPartner || '',
        pickupDateTime: formatDateTimeValue(delivery.pickupDateTime),
        packageWeight: delivery.packageWeight || '',
        courierPrice: delivery.courierPrice ? String(Math.round(delivery.courierPrice)) : '',
        trackingNumber: delivery.trackingNumber || '',
        notes: delivery.notes || ''
    };
};

const DeliveryPage = () => {
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const {
        orders,
        loading: ordersLoading,
        error: ordersError,
        setOrders
    } = useDeliveryOrders();

    const {
        couriers,
        setCouriers,
        loading: couriersLoading,
        error: couriersError
    } = useDeliveryCouriers();

    const {
        updateDeliverySchedule,
        loading: savingSchedule,
        error: updateError
    } = useUpdateDeliverySchedule();

    const [formDraft, setFormDraft] = useState(null);
    const [isCourierOpen, setIsCourierOpen] = useState(false);
    const courierDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                courierDropdownRef.current &&
                !courierDropdownRef.current.contains(event.target)
            ) {
                setIsCourierOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const effectiveSelectedOrderId = selectedOrderId || orders[0]?._id || null;

    const selectedOrder = useMemo(() => {
        return orders.find((order) => order._id === effectiveSelectedOrderId) || null;
    }, [orders, effectiveSelectedOrderId]);

    const selectedOrderForm = useMemo(() => {
        return buildDeliveryForm(selectedOrder);
    }, [selectedOrder]);

    const form = formDraft?.orderId === effectiveSelectedOrderId
        ? formDraft.values
        : selectedOrderForm;

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
                String(order.itemName || '').toLowerCase().includes(keyword) ||
                String(order.customerName || '').toLowerCase().includes(keyword) ||
                String(order.receiptNumber || '').toLowerCase().includes(keyword);

            return matchesTab && matchesSearch;
        });
    }, [orders, tab, search]);

    const shippingRevenue = useMemo(() => {
        return orders.reduce((sum, order) => {
            return sum + Number(order.delivery?.totalPrice || order.deliveryFee || 0);
        }, 0);
    }, [orders]);

    const shippingProfit = useMemo(() => {
        return orders.reduce((sum, order) => {
            return sum + Number(order.delivery?.storeProfit || 0);
        }, 0);
    }, [orders]);

    const courierPriceNumber = Number(form.courierPrice || 0);
    const storeProfit = courierPriceNumber * (STORE_PROFIT_PERCENT / 100);
    const totalPrice = courierPriceNumber + storeProfit;

    const normalizedCouriers = useMemo(() => {
        const mapped = couriers
            .map((courier) => {
                const name = String(courier.name || courier.courierName || '').trim();
                if (!name) return null;

                return {
                    ...courier,
                    name
                };
            })
            .filter(Boolean);

        const uniqueMap = new Map();
        mapped.forEach((courier) => {
            const key = courier.name.toLowerCase();
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, courier);
            }
        });

        return Array.from(uniqueMap.values());
    }, [couriers]);

    const courierKeyword = form.courierPartner.trim();
    const filteredCouriers = useMemo(() => {
        if (!courierKeyword) return normalizedCouriers;

        const keyword = courierKeyword.toLowerCase();
        return normalizedCouriers.filter((courier) =>
            courier.name.toLowerCase().includes(keyword)
        );
    }, [normalizedCouriers, courierKeyword]);

    const exactCourierExists = useMemo(() => {
        const keyword = courierKeyword.toLowerCase();
        if (!keyword) return false;

        return normalizedCouriers.some((courier) => courier.name.toLowerCase() === keyword);
    }, [normalizedCouriers, courierKeyword]);

    const originalCourierExists = useMemo(() => {
        const keyword = courierKeyword.toLowerCase();
        if (!keyword) return false;

        return couriers.some((courier) => {
            const name = String(courier.name || courier.courierName || '').trim().toLowerCase();
            return name === keyword;
        });
    }, [couriers, courierKeyword]);

    const handleSelectOrder = (order) => {
        setSelectedOrderId(order._id);
        setFormDraft({
            orderId: order._id,
            values: buildDeliveryForm(order)
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormDraft({
            orderId: effectiveSelectedOrderId,
            values: {
                ...form,
                [name]: name === 'courierPrice' ? value.replace(/[^\d]/g, '') : value
            }
        });
    };

    const updateFormField = (name, value) => {
        setFormDraft({
            orderId: effectiveSelectedOrderId,
            values: {
                ...form,
                [name]: value
            }
        });
    };

    const handleSelectCourier = (courierName) => {
        updateFormField('courierPartner', courierName);
        setIsCourierOpen(false);
    };

    const handleAddCourier = () => {
        const courierPartner = form.courierPartner.trim();
        if (!courierPartner) {
            toast.error('Courier partner is required');
            return;
        }

        if (exactCourierExists) {
            setIsCourierOpen(false);
            return;
        }

        setCouriers((prev) => [
            ...prev,
            {
                _id: `new-${Date.now()}`,
                name: courierPartner,
                courierName: courierPartner,
                isNew: true
            }
        ]);
        updateFormField('courierPartner', courierPartner);
        setIsCourierOpen(false);
        toast.success('Courier partner added to form');
    };

    const handleSetSchedule = async () => {
        if (!selectedOrder) return;

        const recipientName = form.recipientName.trim();
        const destinationAddress = form.destinationAddress.trim();
        const courierPartner = form.courierPartner.trim();
        const pickupDateTime = form.pickupDateTime;
        const packageWeight = form.packageWeight.trim();
        const trackingNumber = form.trackingNumber.trim();
        const notes = form.notes.trim();

        if (!recipientName) {
            toast.error('Recipient name is required');
            return;
        }

        if (!destinationAddress) {
            toast.error('Destination address is required');
            return;
        }

        if (!courierPartner) {
            toast.error('Courier partner is required');
            return;
        }

        if (!pickupDateTime) {
            toast.error('Pickup date and time is required');
            return;
        }

        if (!packageWeight) {
            toast.error('Package weight is required');
            return;
        }

        if (!courierPriceNumber || courierPriceNumber < 0) {
            toast.error('Courier price is required');
            return;
        }

        const payload = {
            recipientName,
            destinationAddress,
            courierPartner,
            isNewCourierPartner: !originalCourierExists,
            pickupDateTime,
            packageWeight,
            courierPrice: courierPriceNumber,
            storeProfit,
            totalPrice,
            trackingNumber,
            notes
        };

        const result = await updateDeliverySchedule(selectedOrder._id, payload);

        if (!result.success) {
            toast.error(result.error || 'Failed to update delivery');
            return;
        }

        const updatedDelivery =
            result.data?.data?.delivery || {
                ...selectedOrder.delivery,
                ...payload,
                status: 'scheduled'
            };

        setOrders((prev) =>
            prev.map((order) =>
                order._id === selectedOrder._id
                    ? {
                        ...order,
                        deliveryFee: updatedDelivery.totalPrice || totalPrice,
                        delivery: {
                            ...order.delivery,
                            ...updatedDelivery,
                            status: updatedDelivery.status || 'scheduled'
                        }
                    }
                    : order
            )
        );

        toast.success('Delivery schedule updated');
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

                    <button
                        type="button"
                        className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white"
                    >
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {(ordersError || couriersError || updateError) && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                    {ordersError || couriersError || updateError}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-6">
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

                    {ordersLoading ? (
                        <div className="rounded-3xl bg-[#F8F8F8] border border-gray-200 p-8 text-center text-gray-500">
                            Loading delivery orders...
                        </div>
                    ) : (
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
                    )}
                </section>

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
                                <div className="relative" ref={courierDropdownRef}>
                                    <input
                                        type="text"
                                        name="courierPartner"
                                        value={form.courierPartner}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setIsCourierOpen(true);
                                        }}
                                        onFocus={() => setIsCourierOpen(true)}
                                        placeholder={couriersLoading ? 'Loading couriers...' : 'Type or select courier partner'}
                                        disabled={couriersLoading}
                                        className="w-full h-[46px] rounded-xl border border-gray-200 bg-white shadow-sm px-4 pr-10 outline-none focus:ring-2 focus:ring-[#6A4734] disabled:bg-[#FAFAFA]"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setIsCourierOpen((prev) => !prev)}
                                        disabled={couriersLoading}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7D6E66] disabled:opacity-50"
                                        aria-label="Toggle courier list"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>

                                    {isCourierOpen && !couriersLoading && (
                                        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                                            {filteredCouriers.length > 0 && (
                                                <div className="py-1">
                                                    {filteredCouriers.map((courier) => (
                                                        <button
                                                            key={courier._id || courier.id || courier.name}
                                                            type="button"
                                                            onClick={() => handleSelectCourier(courier.name)}
                                                            className="w-full px-4 py-2 text-left text-sm text-[#4E3629] hover:bg-[#F5F5F5]"
                                                        >
                                                            {courier.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {courierKeyword && !exactCourierExists && (
                                                <button
                                                    type="button"
                                                    onClick={handleAddCourier}
                                                    className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-left text-sm font-semibold text-[#6A4734] hover:bg-[#F5F5F5]"
                                                >
                                                    <PlusCircle className="w-4 h-4" />
                                                    Tambah "{courierKeyword}"
                                                </button>
                                            )}

                                            {filteredCouriers.length === 0 && (!courierKeyword || exactCourierExists) && (
                                                <div className="px-4 py-3 text-sm text-gray-500">
                                                    No courier found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
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
                                disabled={savingSchedule}
                                className="w-full h-[48px] rounded-xl bg-[#6A4734] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                            >
                                {savingSchedule ? 'Saving...' : 'Set Schedule'}
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
