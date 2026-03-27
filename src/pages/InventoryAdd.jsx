import React, { useEffect, useMemo, useRef, useState } from 'react';
import useCreateParentProduct from '../hooks/useCreateParentProduct';
import useCategories from '../hooks/useCategories';
import { ArrowLeft } from 'lucide-react';

const InventoryAdd = () => {
    const { createParentProduct, loading, error, setError } = useCreateParentProduct();
    const {
        categories = [],
        loading: categoriesLoading,
        error: categoriesError,
        refetch: refetchCategories
    } = useCategories();

    const fileInputRef = useRef(null);
    const categoryDropdownRef = useRef(null);

    const [form, setForm] = useState({
        productName: '',
        woodType: '',
        categoryName: '',
        description: '',
        parentCode: 'Auto Generate when the product is saved.'
    });

    const [logo, setLogo] = useState(null);
    const [errors, setErrors] = useState({});
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [categoryKeyword, setCategoryKeyword] = useState('');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(event.target)
            ) {
                setIsCategoryOpen(false);
                setCategoryKeyword('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (logo?.previewUrl) {
                URL.revokeObjectURL(logo.previewUrl);
            }
        };
    }, [logo]);

    const normalizedCategories = useMemo(() => {
        if (!Array.isArray(categories)) return [];

        const mapped = categories
            .map((item) => {
                if (typeof item === 'string') {
                    const value = item.trim();
                    return value ? { label: value, value } : null;
                }

                const value = String(item?.categoryName || item?.name || '').trim();
                return value ? { label: value, value } : null;
            })
            .filter(Boolean);

        const uniqueMap = new Map();
        mapped.forEach((item) => {
            const key = item.value.toLowerCase();
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, item);
            }
        });

        return Array.from(uniqueMap.values());
    }, [categories]);

    const filteredCategories = useMemo(() => {
        if (!categoryKeyword.trim()) return normalizedCategories;

        const keyword = categoryKeyword.toLowerCase();
        return normalizedCategories.filter((item) =>
            item.label.toLowerCase().includes(keyword)
        );
    }, [normalizedCategories, categoryKeyword]);

    const exactCategoryExists = useMemo(() => {
        const keyword = categoryKeyword.trim().toLowerCase();
        if (!keyword) return false;

        return normalizedCategories.some(
            (item) => item.value.trim().toLowerCase() === keyword
        );
    }, [normalizedCategories, categoryKeyword]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: ''
        }));

        if (error) setError(null);
    };

    const handleChooseLogo = () => {
        fileInputRef.current?.click();
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (logo?.previewUrl) {
            URL.revokeObjectURL(logo.previewUrl);
        }

        setLogo({
            id: `${file.name}-${Date.now()}`,
            file,
            previewUrl: URL.createObjectURL(file)
        });

        setErrors((prev) => ({
            ...prev,
            logo: ''
        }));

        e.target.value = '';
    };

    const handleRemoveLogo = () => {
        if (logo?.previewUrl) {
            URL.revokeObjectURL(logo.previewUrl);
        }
        setLogo(null);
    };

    const handleSelectCategory = (category) => {
        setForm((prev) => ({
            ...prev,
            categoryName: category
        }));

        setCategoryKeyword(category);

        setErrors((prev) => ({
            ...prev,
            categoryName: ''
        }));

        setIsCategoryOpen(false);
    };

    const handleUseManualCategory = () => {
        const value = categoryKeyword.trim();
        if (!value) return;

        setForm((prev) => ({
            ...prev,
            categoryName: value
        }));

        setErrors((prev) => ({
            ...prev,
            categoryName: ''
        }));

        setIsCategoryOpen(false);
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!form.productName.trim()) nextErrors.productName = 'Parent product name is required';
        if (!form.woodType.trim()) nextErrors.woodType = 'Wood type is required';
        if (!form.categoryName.trim()) nextErrors.categoryName = 'Category is required';
        if (!form.description.trim()) nextErrors.description = 'Description is required';
        if (!logo) nextErrors.logo = 'Logo is required';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
        });
    };

    const buildPayload = async () => {
        const logoBase64 = logo?.file ? await fileToBase64(logo.file) : '';

        return {
            categoryName: form.categoryName.trim(),
            productName: form.productName.trim(),
            description: form.description.trim(),
            woodTypes: [form.woodType.trim()],
            logo: logoBase64
        };
    };

    const resetForm = () => {
        if (logo?.previewUrl) {
            URL.revokeObjectURL(logo.previewUrl);
        }

        setForm({
            productName: '',
            woodType: '',
            categoryName: '',
            description: '',
            parentCode: 'Auto Generate when the product is saved.'
        });

        setLogo(null);
        setErrors({});
        setIsCategoryOpen(false);
        setCategoryKeyword('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const payload = await buildPayload();
            const result = await createParentProduct(payload);

            if (result.success) {
                alert('Parent product created successfully');
                resetForm();

                if (typeof refetchCategories === 'function') {
                    refetchCategories();
                }
            } else {
                alert(result.error || 'Failed to create parent product');
            }
        } catch (err) {
            alert('Failed to process logo');
        }
    };

    const handleCancel = () => {
        resetForm();
        if (error) setError(null);
    };

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div className="w-full">
            <div className="flex items-center mb-4">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6A4734] text-white hover:opacity-90"
                >
                    <ArrowLeft size={20} />
                </button>

                <h1 className="text-2xl font-bold text-[#4F3427] ml-4">
                    Add Parent Product
                </h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#F5F5F5] rounded-2xl shadow-md p-6">
                        <h2 className="text-xl font-semibold text-[#4F3427] mb-4">
                            Upload Logo
                        </h2>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                        />

                        <div className="border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 p-4">
                            <div className="w-full h-[380px] rounded-xl bg-white flex items-center justify-center overflow-hidden mb-4">
                                {logo ? (
                                    <img
                                        src={logo.previewUrl}
                                        alt="Logo Preview"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <div className="text-6xl mb-3">🪵</div>
                                        <p className="text-sm">No logo selected</p>
                                    </div>
                                )}
                            </div>

                            {errors.logo && (
                                <p className="text-red-500 text-sm mb-3">{errors.logo}</p>
                            )}

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleChooseLogo}
                                    className="rounded-xl bg-[#6A4734] text-white px-4 py-2 hover:opacity-90 transition"
                                >
                                    {logo ? 'Change Logo' : 'Upload Logo'}
                                </button>

                                {logo && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveLogo}
                                        className="rounded-xl bg-red-100 text-red-600 px-4 py-2 hover:bg-red-200 transition"
                                    >
                                        Remove Logo
                                    </button>
                                )}
                            </div>

                            <p className="text-xs text-gray-400 mt-3">
                                Only 1 logo is allowed for each parent product.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#F5F5F5] rounded-2xl shadow-md p-6">
                        <h2 className="text-xl font-semibold text-[#4F3427] mb-6">
                            Product Description
                        </h2>

                        {error && (
                            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Parent Product Name
                                </label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={form.productName}
                                    onChange={handleChange}
                                    placeholder="Enter parent product name"
                                    className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                />
                                {errors.productName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.productName}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Wood Type
                                    </label>
                                    <input
                                        type="text"
                                        name="woodType"
                                        value={form.woodType}
                                        onChange={handleChange}
                                        placeholder="Ex: Kayu Jati"
                                        className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                    />
                                    {errors.woodType && (
                                        <p className="text-red-500 text-sm mt-1">{errors.woodType}</p>
                                    )}
                                </div>

                                <div className="relative" ref={categoryDropdownRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!categoriesLoading) {
                                                setIsCategoryOpen((prev) => !prev);
                                                setCategoryKeyword(form.categoryName || '');
                                            }
                                        }}
                                        className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 text-left flex items-center justify-between outline-none focus:ring-2 focus:ring-[#6A4734]"
                                    >
                                        <span className={form.categoryName ? 'text-gray-900' : 'text-gray-400'}>
                                            {categoriesLoading
                                                ? 'Loading categories...'
                                                : form.categoryName || 'Select or type category'}
                                        </span>
                                        <span className="text-gray-500 text-sm">
                                            {isCategoryOpen ? '▲' : '▼'}
                                        </span>
                                    </button>

                                    {errors.categoryName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.categoryName}</p>
                                    )}

                                    {categoriesError && (
                                        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                            {categoriesError}
                                            {typeof refetchCategories === 'function' && (
                                                <button
                                                    type="button"
                                                    onClick={refetchCategories}
                                                    className="ml-2 underline"
                                                >
                                                    Retry
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {isCategoryOpen && (
                                        <div className="absolute z-20 mt-2 w-full rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
                                            <div className="p-3 border-b border-gray-100">
                                                <input
                                                    type="text"
                                                    value={categoryKeyword}
                                                    onChange={(e) => setCategoryKeyword(e.target.value)}
                                                    placeholder="Search or type new category"
                                                    className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                                    autoFocus
                                                />

                                                {categoryKeyword.trim() && !exactCategoryExists && (
                                                    <button
                                                        type="button"
                                                        onClick={handleUseManualCategory}
                                                        className="mt-2 w-full rounded-xl bg-[#6A4734] text-white px-4 py-2 text-sm hover:opacity-90"
                                                    >
                                                        Use "{categoryKeyword.trim()}" as new category
                                                    </button>
                                                )}
                                            </div>

                                            <div className="max-h-72 overflow-y-auto">
                                                {categoriesLoading ? (
                                                    <div className="px-5 py-4 text-sm text-gray-500">
                                                        Loading categories...
                                                    </div>
                                                ) : filteredCategories.length > 0 ? (
                                                    filteredCategories.map((category, index) => (
                                                        <button
                                                            key={`${category.value}-${index}`}
                                                            type="button"
                                                            onClick={() => handleSelectCategory(category.value)}
                                                            className="w-full text-left px-5 py-4 text-base text-[#4F3427] hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            {category.label}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-5 py-4 text-sm text-gray-500">
                                                        No matching category
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={7}
                                    placeholder="Write product description..."
                                    className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734] resize-none"
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Parent Code
                                </label>
                                <input
                                    type="text"
                                    name="parentCode"
                                    value={form.parentCode}
                                    readOnly
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 shadow-md px-4 py-3 text-gray-500"
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    Auto Generate when the product is saved.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="min-w-[140px] rounded-xl bg-red-600 text-white px-6 py-3 font-medium hover:bg-red-700 transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="min-w-[180px] rounded-xl bg-[#6A4734] text-white px-6 py-3 font-medium hover:opacity-90 transition disabled:opacity-60"
                                >
                                    {loading ? 'Saving...' : 'Add Parent Product'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default InventoryAdd;