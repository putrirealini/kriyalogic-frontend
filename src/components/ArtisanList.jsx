import React from 'react';
import { Pencil, Trash2, User2 } from 'lucide-react';

const ArtisanList = ({ artisans, selectedArtisan, onSelectArtisan, onEdit, onDelete, searchQuery }) => {
    const highlightText = (text) => {
        if (!searchQuery || !text) return text || '-';
        
        const parts = text.toString().split(new RegExp(`(${searchQuery})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) => 
                    part.toLowerCase() === searchQuery.toLowerCase() ? (
                        <span key={i} className="bg-yellow-200 font-bold">{part}</span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse">
                <thead className="bg-[#EEF1F4] text-gray-800">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                            Artisan Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                            Phone Number
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                            Commission
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                            Aksi
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {artisans.map((item, index) => (
                        <tr
                            key={item._id || item.id || index}
                            className={`border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${selectedArtisan?._id === item._id || selectedArtisan?.id === item.id ? 'bg-blue-50' : ''}`}
                            onClick={() => onSelectArtisan(item)}
                        >
                            <td className="px-4 py-3 text-sm flex flex-row gap-1"><User2 className="w-4 h-4" /> {highlightText(item.fullName)}</td>
                            <td className="px-4 py-3 text-sm">{highlightText(item.phoneNumber)}</td>
                            <td className="px-4 py-3 text-sm">{item.commissionRate ? `${item.commissionRate}%` : '-'}</td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <button 
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(item);
                                        }}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        className="text-red-600 hover:text-red-800"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(item._id || item.id);
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ArtisanList;
