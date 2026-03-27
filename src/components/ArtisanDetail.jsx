import React from 'react';
import { Phone, MapPin, Percent, Landmark, BoxIcon, BoxesIcon, X } from 'lucide-react';

const ArtisanDetail = ({ selectedArtisan, onClose }) => {
    const formatRupiah = (value) => {
        const number = Number(value || 0);

        return `Rp. ${number.toLocaleString('id-ID')}`;
    };

    return (
        <div className={`w-full lg:w-[40%] p-4 h-full ${selectedArtisan ? 'fixed inset-0 z-50 bg-white lg:static lg:bg-transparent' : 'hidden lg:block'}`}>
            {selectedArtisan ? (
                <div className='border-4 border-primary rounded-3xl px-5 py-10 relative'>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full lg:hidden hover:bg-gray-200"
                    >
                        <X size={20} />
                    </button>
                    <h2 className='text-[24px] font-bold text-[#5A3B2D] mb-5'>Detail Artisan {selectedArtisan.fullName || '-'}</h2>

                    <div className='bg-primary rounded-xl p-2'>
                        <div className='text-[#E7E5DB] flex gap-2 py-2 px-4 items-center'>
                            <Phone className="w-5 h-5" />
                            <p className='text-xs'>{selectedArtisan.phoneNumber || '-'}</p>
                        </div>
                        <div className='text-[#E7E5DB] flex gap-2 py-2 px-4 items-center'>
                            <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className='text-xs'>{selectedArtisan.address || '-'}</p>
                        </div>
                        <div className='text-[#E7E5DB] flex gap-2 py-2 px-4 items-center'>
                            <Percent className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className='text-xs'>Default Commission: {selectedArtisan.commissionRate ? `${selectedArtisan.commissionRate}%` : '-'}</p>
                        </div>
                        <div className='text-[#E7E5DB] flex gap-2 py-2 px-4 items-center'>
                            <Landmark className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className='text-xs'>{selectedArtisan.bankAccount || '-'} (Rekening)</p>
                        </div>
                    </div>

                    <div className='flex flex-row gap-2 mt-4 justify-between'>
                        <div className='bg-primary rounded-md text-white flex items-center gap-2 p-4 w-1/2'>
                            <BoxIcon className="w-9 h-9" />
                            <div className='flex flex-col gap-1'>
                                <h3 className="text-[11px] font-normal text-[#E7E5DB]">Total Products</h3>
                                <p className="text-sm font-semibold">{selectedArtisan.productCount || '-'}</p>
                            </div>
                        </div>
                        <div className='bg-primary rounded-md text-white flex items-center gap-2 p-4 w-1/2'
                        onClick={() => window.location.href = `/dashboard/partners/artisans/commission/${selectedArtisan._id}`}
                        style={{ cursor: 'pointer' }}
                        >
                            <BoxesIcon className="w-9 h-9" />
                            <div className='flex flex-col gap-1'>
                                <h3 className="text-[11px] font-normal text-[#E7E5DB]">Pending Payout</h3>
                                <p className="text-sm font-semibold">{formatRupiah(selectedArtisan?.totalPendingPayout)}</p>
                            </div>
                        </div>
                    </div>

                    <p className='font-semibold mt-5'>Product Portfolio</p>
                    <div className="overflow-x-auto mt-2">
                        <table className="w-full border-collapse border border-gray-600">
                            <thead className="bg-[#594539] text-white">
                                <tr>
                                    <th className="px-2 py-1 border border-gray-600 text-center font-semibold text-xs">Code</th>
                                    <th className="px-2 py-1 border border-gray-600 text-center font-semibold text-xs">Product Name</th>
                                    <th className="px-2 py-1 border border-gray-600 text-center font-semibold text-xs">Price</th>
                                    <th className="px-2 py-1 border border-gray-600 text-center font-semibold text-xs">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(selectedArtisan.products || []).length > 0 ? (
                                    selectedArtisan.products.map((item, index) => (
                                        <tr key={index} className="bg-white">
                                            <td className="px-2 py-1 border border-gray-600 text-center text-gray-700 text-xs">{item.code || '-'}</td>
                                            <td className="px-2 py-1 border border-gray-600 text-left text-gray-700 text-xs">{item.name || '-'}</td>
                                            <td className="px-2 py-1 border border-gray-600 text-center text-gray-700 text-xs">{item.price || '-'}</td>
                                            <td className="px-2 py-1 border border-gray-600 text-center text-gray-700 text-xs">{item.stock || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="bg-white">
                                        <td colSpan="4" className="px-2 py-1 border border-gray-600 text-center text-gray-700 text-xs">-</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 font-medium text-lg text-center">
                        Klik salah satu data pada tabel untuk melihat detail
                    </p>
                </div>
            )}
        </div>
    );
};

export default ArtisanDetail;
