import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { User } from 'lucide-react';
import useStoreSettings from '../hooks/useStoreSettings';

const SettingPage = () => {
    const {
        settings,
        loading,
        saving,
        error,
        setError,
        updateStoreSettings
    } = useStoreSettings();

    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        shopNameOnReceipt: '',
        slogan: '',
        storeAddress: '',
        footerGreeting: '',
        returnPolicyText: '',
        whatsappNumber: '',
        instagramUsername: '',
        isTaxed: false,
        logo: '',
    });

    const [logoPreview, setLogoPreview] = useState('');
    const [logoFile, setLogoFile] = useState(null);

    useEffect(() => {
        if (!settings) return;

        setForm({
            shopNameOnReceipt: settings.shopNameOnReceipt || '',
            slogan: settings.slogan || '',
            storeAddress: settings.storeAddress || '',
            footerGreeting: settings.footerGreeting || '',
            returnPolicyText: settings.returnPolicyText || '',
            whatsappNumber: settings.whatsappNumber || '',
            instagramUsername: settings.instagramUsername || '',
            isTaxed: Boolean(settings.isTaxed),
            logo: settings.logo || '',
        });

        setLogoPreview(settings.logo || '');
        setLogoFile(null);
    }, [settings]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

        if (error) setError(null);
    };

    const handleToggleTax = () => {
        setForm((prev) => ({
            ...prev,
            isTaxed: !prev.isTaxed
        }));
    };

    const handleChooseLogo = () => {
        fileInputRef.current?.click();
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLogoFile(file);

        const previewUrl = URL.createObjectURL(file);
        setLogoPreview(previewUrl);

        e.target.value = '';
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let logoValue = form.logo;

        if (logoFile) {
            logoValue = await fileToBase64(logoFile);
        }

        const payload = {
            shopNameOnReceipt: form.shopNameOnReceipt.trim(),
            slogan: form.slogan.trim(),
            storeAddress: form.storeAddress.trim(),
            footerGreeting: form.footerGreeting.trim(),
            returnPolicyText: form.returnPolicyText.trim(),
            whatsappNumber: form.whatsappNumber.trim(),
            instagramUsername: form.instagramUsername.trim(),
            isTaxed: form.isTaxed,
            logo: logoValue
        };

        const result = await updateStoreSettings(payload);

        if (result.success) {
            toast.success('Store settings saved successfully');
        } else {
            toast.error(result.error || 'Failed to save store settings');
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading...</div>;
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[#4F3427]">
                    Store Settings
                </h1>
            </div>

            {error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.9fr] gap-8">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                        {/* RECEIPT EDITOR */}
                        <div className="bg-[#F5F5F5] rounded-2xl shadow-sm p-6">
                            <h2 className="text-[28px] font-semibold text-[#5A3B2D] mb-6">
                                Receipt Editor
                            </h2>

                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm text-[#6B5A50] mb-2">
                                            Shop Name on Receipt
                                        </label>
                                        <input
                                            type="text"
                                            name="shopNameOnReceipt"
                                            value={form.shopNameOnReceipt}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[#6B5A50] mb-2">
                                            Slogan (Below Shop Name)
                                        </label>
                                        <input
                                            type="text"
                                            name="slogan"
                                            value={form.slogan}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-[#6B5A50] mb-2">
                                        Store Address
                                    </label>
                                    <input
                                        type="text"
                                        name="storeAddress"
                                        value={form.storeAddress}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[#6B5A50] mb-2">
                                        Footer Greeting
                                    </label>
                                    <input
                                        type="text"
                                        name="footerGreeting"
                                        value={form.footerGreeting}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[#6B5A50] mb-2">
                                        Return Policy Text
                                    </label>
                                    <textarea
                                        name="returnPolicyText"
                                        value={form.returnPolicyText}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734] resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* GET IN TOUCH */}
                        <div className="bg-[#F5F5F5] rounded-2xl shadow-sm p-6">
                            <h2 className="text-[28px] font-semibold text-[#5A3B2D] mb-6">
                                Get In Touch Settings
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm text-[#6B5A50] mb-2">
                                        Whatsapp Number
                                    </label>
                                    <input
                                        type="text"
                                        name="whatsappNumber"
                                        value={form.whatsappNumber}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[#6B5A50] mb-2">
                                        Instagram Username
                                    </label>
                                    <input
                                        type="text"
                                        name="instagramUsername"
                                        value={form.instagramUsername}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        {/* LOGO CARD */}
                        <div className="bg-[#6A4734] rounded-[40px] p-8 min-h-[330px] relative overflow-hidden shadow-md">
                            <div className="absolute top-0 right-0 w-28 h-28 bg-[#8D6A58] opacity-35 rounded-full translate-x-8 -translate-y-2" />

                            <div className="text-center h-full flex flex-col items-center justify-center">
                                <div className="text-white/80 text-xs tracking-[4px] font-bold mb-8">
                                    RECEIPT LOGO
                                </div>

                                <button
                                    type="button"
                                    onClick={handleChooseLogo}
                                    className="flex flex-col items-center justify-center"
                                >
                                    <div className="w-28 h-28 rounded-full border-4 border-white/30 overflow-hidden flex items-center justify-center bg-transparent mb-8">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Receipt Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white text-3xl">🖼️</span>
                                        )}
                                    </div>

                                    <div className="text-white text-[22px] font-bold tracking-[4px]">
                                        EDIT LOGO
                                    </div>
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* FINANCIAL POLICY */}
                        <div className="bg-[#F8F8F8] rounded-[40px] p-8 shadow-sm border border-gray-200">
                            <div className="text-center text-[#5A3B2D] text-sm tracking-[3px] font-bold mb-8">
                                FINANCIAL POLICY
                            </div>

                            <div className="bg-[#F1F1F1] rounded-2xl px-6 py-5 flex items-center justify-between">
                                <span className="text-[#5A3B2D] font-semibold">
                                    TAX (PPN 11%)
                                </span>

                                <button
                                    type="button"
                                    onClick={handleToggleTax}
                                    className={`w-12 h-7 rounded-full transition relative ${
                                        form.isTaxed ? 'bg-[#15C55B]' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition ${
                                            form.isTaxed ? 'right-1' : 'left-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="min-w-[210px] rounded-xl bg-[#6A4734] text-white px-8 py-4 font-medium hover:opacity-90 transition disabled:opacity-60"
                            >
                                {saving ? 'Saving...' : 'Save All Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SettingPage;
