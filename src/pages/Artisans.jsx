import React, { useState } from 'react';
import ArtisanHeader from '../components/ArtisanHeader';
import ArtisanList from '../components/ArtisanList';
import ArtisanDetail from '../components/ArtisanDetail';
import AddArtisanModal from '../components/AddArtisanModal';
import EditArtisanModal from '../components/EditArtisanModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import useArtisans from '../hooks/useArtisans';
import useDeleteArtisan from '../hooks/useDeleteArtisan';
import toast from 'react-hot-toast';

const Artisans = () => {
    const [selectedArtisan, setSelectedArtisan] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [artisanToEdit, setArtisanToEdit] = useState(null);
    const [artisanToDelete, setArtisanToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { artisans, loading, error, refetch } = useArtisans();
    const { deleteArtisan } = useDeleteArtisan();

    const filteredArtisans = artisans.filter(artisan => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            (artisan.fullName && artisan.fullName.toLowerCase().includes(query)) ||
            (artisan.phoneNumber && artisan.phoneNumber.toLowerCase().includes(query))
        );
    });

    const handleEdit = (artisan) => {
        setArtisanToEdit(artisan);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (id) => {
        setArtisanToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!artisanToDelete) return;
        
        setIsDeleting(true);
        const result = await deleteArtisan(artisanToDelete);
        setIsDeleting(false);
        
        if (result.success) {
            toast.success('Artisan deleted successfully');
            if (selectedArtisan && (selectedArtisan.id === artisanToDelete || selectedArtisan._id === artisanToDelete)) {
                setSelectedArtisan(null);
            }
            refetch();
            setIsDeleteModalOpen(false);
            setArtisanToDelete(null);
        } else {
            toast.error(result.error || 'Failed to delete artisan');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen md:px-6">
            {/* Left Content */}
            <div className="w-full lg:w-[65%] overflow-y-auto">
                <div className='p-4'>
                    <img src="/hero-image-artisan-page.png" alt="" className='w-full h-auto object-contain' />
                </div>
                <div className="p-4">
                    <ArtisanHeader
                        totalArtisans={filteredArtisans.length}
                        onAddArtisan={() => setIsAddModalOpen(true)}
                        searchQuery={searchQuery}
                        onSearch={setSearchQuery}
                    />
                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-600">Error: {error}</div>
                    ) : (
                        <ArtisanList
                            artisans={filteredArtisans}
                            selectedArtisan={selectedArtisan}
                            onSelectArtisan={setSelectedArtisan}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            searchQuery={searchQuery}
                        />
                    )}
                </div>
            </div>

            {/* Right Content */}
            <ArtisanDetail
                selectedArtisan={selectedArtisan}
                onClose={() => setSelectedArtisan(null)}
            />

            {/* Modals */}
            <AddArtisanModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={refetch}
            />

            <EditArtisanModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={refetch}
                artisan={artisanToEdit}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setArtisanToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Artisan"
                message="Are you sure you want to delete this artisan? This action cannot be undone."
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default Artisans;
