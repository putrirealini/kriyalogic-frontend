import React from 'react';
import { Search, Plus } from 'lucide-react';

const ArtisanHeader = ({ totalArtisans, onAddArtisan, searchQuery, onSearch }) => {
    return (
        <div className='flex flex-col md:flex-row justify-between gap-4'>
            <div className='flex flex-col md:flex-row gap-4 w-full md:w-auto'>
                <div className='bg-primary py-2 px-10 rounded-xl text-[#E7E5DB] font-bold flex items-center justify-center text-sm'>
                    Total {totalArtisans}
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 text-sm rounded-xl outline-none focus:border-primary w-full md:w-64"
                    />
                </div>
            </div>
            <div className='w-full md:w-auto'>
                <button
                    onClick={onAddArtisan}
                    className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors text-sm w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    Add Artisan
                </button>
            </div>
        </div>
    );
};

export default ArtisanHeader;
