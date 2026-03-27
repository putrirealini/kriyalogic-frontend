import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useDetailParentProduct from '../hooks/useDetailParentProduct';
import useCreateChildProduct from '../hooks/useCreateChildProduct';
import useArtisans from '../hooks/useArtisans';
import toast from 'react-hot-toast';

const statusOptions = ['available'];

const InventoryAddChildProduct = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const parentId = searchParams.get('parentId');

    const { parentProduct, loading: parentLoading, error: parentError } = useDetailParentProduct(parentId);
    const { artisans, loading: artisanLoading, error: artisanError } = useArtisans();
    const { createChildProduct, loading, error, setError } = useCreateChildProduct();

    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        itemName: '',
        artisanId: '',
        costPrice: '',
        sellingPrice: '',
        serialCode: '',
        status: 'available',
        parentProductName: '',
        height: '',
        width: '',
        notes: ''
    });

    const [images, setImages] = useState([]);
    const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
    const [errors, setErrors] = useState({});
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isArtisanOpen, setIsArtisanOpen] = useState(false);

    useEffect(() => {
        if (!parentProduct) return;

        setForm((prev) => ({
            ...prev,
            parentProductName: parentProduct.productName || ''
        }));
    }, [parentProduct]);

    const selectedImage = useMemo(() => {
        if (!images.length) return null;
        return images[selectedPreviewIndex] || images[0];
    }, [images, selectedPreviewIndex]);

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

    const handleChooseImages = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

        const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE);
        const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE);

        if (invalidFiles.length > 0) {
            setErrors((prev) => ({
                ...prev,
                images: `Max file size is 5 MB. Invalid file(s): ${invalidFiles
                    .map((file) => file.name)
                    .join(', ')}`
            }));
        } else {
            setErrors((prev) => ({
                ...prev,
                images: ''
            }));
        }

        if (!validFiles.length) {
            e.target.value = '';
            return;
        }

        const mappedFiles = validFiles.map((file, index) => ({
            id: `${file.name}-${Date.now()}-${index}`,
            file,
            previewUrl: URL.createObjectURL(file),
            isCover: images.length === 0 && index === 0
        }));

        setImages((prev) => {
            const next = [...prev, ...mappedFiles];
            if (!next.some((img) => img.isCover) && next.length > 0) {
                next[0].isCover = true;
            }
            return next;
        });

        if (!images.length) {
            setSelectedPreviewIndex(0);
        }

        e.target.value = '';
    };

    const handleSetCover = (index) => {
        setImages((prev) =>
            prev.map((img, i) => ({
                ...img,
                isCover: i === index
            }))
        );
        setSelectedPreviewIndex(index);
    };

    const handleRemoveImage = (index) => {
        setImages((prev) => {
            const removed = prev[index];
            if (removed?.previewUrl) {
                URL.revokeObjectURL(removed.previewUrl);
            }

            const filtered = prev.filter((_, i) => i !== index);

            if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
                filtered[0].isCover = true;
            }

            return filtered;
        });

        setSelectedPreviewIndex((prev) => {
            if (index === prev) return 0;
            if (index < prev) return prev - 1;
            return prev;
        });
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!parentId) nextErrors.parentId = 'Parent product id is required';
        if (!form.parentProductName.trim()) nextErrors.parentProductName = 'Parent product is required';
        if (!form.itemName.trim()) nextErrors.itemName = 'Item name is required';
        if (!form.artisanId) nextErrors.artisanId = 'Artisan is required';
        if (form.costPrice === '' || Number(form.costPrice) < 0) nextErrors.costPrice = 'Valid cost price is required';
        if (form.sellingPrice === '' || Number(form.sellingPrice) < 0) nextErrors.sellingPrice = 'Valid selling price is required';
        if (!form.status) nextErrors.status = 'Status is required';
        // if (images.length === 0) nextErrors.images = 'At least 1 image is required';

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
        const coverImage = images.find((img) => img.isCover) || images[0];
        const productPhoto = coverImage?.file ? await fileToBase64(coverImage.file) : '';

        const height = form.height ? String(form.height).trim() : '';
        const width = form.width ? String(form.width).trim() : '';
        const dimension = height && width ? `${height} x ${width}` : height || width || '';

        return {
            itemName: form.itemName.trim(),
            // serialCode: form.serialCode.trim(),
            productPhoto,
            woodType:
                Array.isArray(parentProduct?.woodTypes) && parentProduct.woodTypes.length
                    ? parentProduct.woodTypes[0]
                    : '',
            dimension,
            artisanId: form.artisanId,
            costPrice: Number(form.costPrice),
            sellingPrice: Number(form.sellingPrice),
            status: form.status,
            notes: form.notes.trim()
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const payload = await buildPayload();
            const result = await createChildProduct(parentId, payload);

            if (result.success) {
                toast.success('Child product created successfully');
                navigate(`/dashboard/inventory/detail/${parentId}`);
            } else {
                toast.error(result.error || 'Failed to create child product');
            }
        } catch (err) {
            toast.error('Failed to process image');
        }
    };

    const handleCancel = () => {
        if (parentId) {
            navigate(`/dashboard/inventory/detail/${parentId}`);
            return;
        }
        navigate('/dashboard/inventory');
    };

    return (
        <div className="w-full">
            <div className="flex items-center mb-4">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6A4734] text-white hover:opacity-90"
                >
                    <ArrowLeft size={20} />
                </button>

                <h1 className="text-2xl font-bold text-[#4F3427] ml-4">
                    Add Child Product
                </h1>
            </div>

            {(parentError || artisanError || error || errors.parentId) && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                    {errors.parentId || parentError || artisanError || error}
                </div>
            )}

            {(parentLoading || artisanLoading) ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-[#F5F5F5] rounded-2xl shadow-md p-6">
                            <h2 className="text-xl font-semibold text-[#4F3427] mb-4">
                                Upload Image
                            </h2>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            <div className="border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 p-4">
                                <div className="w-full h-[380px] rounded-xl bg-white flex items-center justify-center overflow-hidden mb-4">
                                    {selectedImage ? (
                                        <img
                                            src={selectedImage.previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <div className="text-6xl mb-3">🖼️</div>
                                            <p className="text-sm">No image selected</p>
                                            <button
                                                type="button"
                                                onClick={handleChooseImages}
                                                className="mt-4 px-4 py-2 rounded-xl bg-[#6A4734] text-white hover:opacity-90"
                                            >
                                                Upload Images
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {errors.images && (
                                    <p className="text-red-500 text-sm mb-3">{errors.images}</p>
                                )}

                                <div className="grid grid-cols-4 gap-3">
                                    {images.map((img, index) => (
                                        <div
                                            key={img.id}
                                            className={`relative border rounded-xl overflow-hidden bg-white ${
                                                selectedPreviewIndex === index
                                                    ? 'ring-2 ring-[#6A4734]'
                                                    : 'border-gray-200'
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPreviewIndex(index)}
                                                className="w-full h-20 block"
                                            >
                                                <img
                                                    src={img.previewUrl}
                                                    alt={`Thumb ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>

                                            <div className="p-2 space-y-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetCover(index)}
                                                    className={`w-full text-xs rounded-md px-2 py-1 ${
                                                        img.isCover
                                                            ? 'bg-[#6A4734] text-white'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {img.isCover ? 'Cover' : 'Set Cover'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="w-full text-xs rounded-md px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={handleChooseImages}
                                        className="h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-3xl text-gray-400 hover:border-[#6A4734] hover:text-[#6A4734] transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="bg-[#F5F5F5] rounded-2xl shadow-md p-6">
                                <h2 className="text-lg font-semibold text-[#4F3427] mb-4">
                                    Item Production and Pricing
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">
                                            Add Item Name
                                        </label>
                                        <input
                                            type="text"
                                            name="itemName"
                                            value={form.itemName}
                                            onChange={handleChange}
                                            placeholder="Add Item Name"
                                            className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                        />
                                        {errors.itemName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.itemName}</p>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm text-gray-700 mb-2">
                                            Choose Artisan
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => setIsArtisanOpen((prev) => !prev)}
                                            className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 bg-white text-left flex items-center justify-between outline-none focus:ring-2 focus:ring-[#6A4734]"
                                        >
                                            <span className={form.artisanId ? 'text-gray-900' : 'text-gray-400'}>
                                                {form.artisanId
                                                    ? artisans.find((artisan) => artisan._id === form.artisanId)?.fullName || 'Selected Artisan'
                                                    : 'Choose Artisan'}
                                            </span>
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        </button>

                                        {isArtisanOpen && (
                                            <div className="absolute z-20 mt-2 w-full rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden max-h-64 overflow-y-auto">
                                                {artisans.length > 0 ? (
                                                    artisans.map((artisan) => (
                                                        <button
                                                            key={artisan._id}
                                                            type="button"
                                                            onClick={() => {
                                                                setForm((prev) => ({
                                                                    ...prev,
                                                                    artisanId: artisan._id
                                                                }));
                                                                setErrors((prev) => ({
                                                                    ...prev,
                                                                    artisanId: ''
                                                                }));
                                                                setIsArtisanOpen(false);
                                                            }}
                                                            className="w-full text-left px-5 py-4 text-sm text-[#4F3427] hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            {artisan.fullName}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-5 py-4 text-sm text-gray-400">
                                                        No artisan found
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {errors.artisanId && (
                                            <p className="text-red-500 text-sm mt-1">{errors.artisanId}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-2">
                                                Add Cost Price
                                            </label>
                                            <input
                                                type="number"
                                                name="costPrice"
                                                value={form.costPrice}
                                                onChange={handleChange}
                                                placeholder="Add Cost Price"
                                                className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                            />
                                            {errors.costPrice && (
                                                <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-700 mb-2">
                                                Add Selling Price
                                            </label>
                                            <input
                                                type="number"
                                                name="sellingPrice"
                                                value={form.sellingPrice}
                                                onChange={handleChange}
                                                placeholder="Add Selling Price"
                                                className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                            />
                                            {errors.sellingPrice && (
                                                <p className="text-red-500 text-sm mt-1">{errors.sellingPrice}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#F5F5F5] rounded-2xl shadow-md p-6">
                                <h2 className="text-lg font-semibold text-[#4F3427] mb-4">
                                    Unique Item Specification
                                </h2>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-2">
                                                Serial Code
                                            </label>
                                            <input
                                                type="text"
                                                name="serialCode"
                                                value={form.serialCode}
                                                readOnly
                                                placeholder="Auto-generated"
                                                className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                            />
                                            <small className="text-gray-500">
                                                Auto Generate when the product is saved.
                                            </small>
                                        </div>

                                        <div className="relative">
                                            <label className="block text-sm text-gray-700 mb-2">
                                                Choose status
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() => setIsStatusOpen((prev) => !prev)}
                                                className="w-full rounded-xl border border-gray-200  px-4 py-3 bg-white shadow-md text-left flex items-center justify-between outline-none focus:ring-2 focus:ring-[#6A4734]"
                                            >
                                                <span className="capitalize text-gray-800">
                                                    {form.status}
                                                </span>
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </button>

                                            {isStatusOpen && (
                                                <div className="absolute z-20 mt-2 w-full rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
                                                    {statusOptions.map((status) => (
                                                        <button
                                                            key={status}
                                                            type="button"
                                                            onClick={() => {
                                                                setForm((prev) => ({
                                                                    ...prev,
                                                                    status
                                                                }));
                                                                setErrors((prev) => ({
                                                                    ...prev,
                                                                    status: ''
                                                                }));
                                                                setIsStatusOpen(false);
                                                            }}
                                                            className="w-full text-left px-5 py-4 text-sm text-[#4F3427] hover:bg-gray-50 border-b border-gray-100 last:border-b-0 capitalize"
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {errors.status && (
                                                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">
                                            Parent Product
                                        </label>
                                        <input
                                            type="text"
                                            name="parentProductName"
                                            value={form.parentProductName}
                                            readOnly
                                            className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 bg-gray-50 text-gray-500"
                                        />
                                        {errors.parentProductName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.parentProductName}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-2">
                                                Add Height
                                            </label>
                                            <input
                                                type="text"
                                                name="height"
                                                value={form.height}
                                                onChange={handleChange}
                                                placeholder="Add Height"
                                                className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-700 mb-2">
                                                Add Width
                                            </label>
                                            <input
                                                type="text"
                                                name="width"
                                                value={form.width}
                                                onChange={handleChange}
                                                placeholder="Add Width"
                                                className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">
                                            Specific Notes
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={form.notes}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Specific Notes"
                                            className="w-full rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#6A4734] resize-none"
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-2">
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
                                            {loading ? 'Saving...' : 'Add Child Product'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default InventoryAddChildProduct;