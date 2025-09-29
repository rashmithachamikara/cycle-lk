import { useEffect, useState } from "react";
import { Bike, bikeService } from "../../services/bikeService";
import Inventory from "../../components/PartnerDashboard/Inventory";
import Header from "../../components/Header";


const InventoryPage = () => {
    const [bikes, setBikes] = useState<Bike[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bikeToDelete, setBikeToDelete] = useState<{id: string, name: string} | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    const fetchBikes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const bikeList = await bikeService.getMyBikes();
            console.log('Fetched bikes:', bikeList);
            setBikes(bikeList);
        } catch (err) {
            setError('Failed to fetch bikes. Please try again.');
            console.error('Error fetching bikes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!bikeToDelete) return;
        
        try {
            setIsDeleting(true);
            await bikeService.deleteBike(bikeToDelete.id);
            setDeleteSuccess(true);
            
            // Remove the deleted bike from the list
            setBikes(prevBikes => prevBikes.filter(bike => bike.id !== bikeToDelete.id));
            
            // Hide modal after a short delay
            setTimeout(() => {
                setShowDeleteModal(false);
                setBikeToDelete(null);
                setDeleteSuccess(false);
            }, 1500);
            
        } catch (err) {
            console.error('Error deleting bike:', err);
            setError('Failed to delete bike. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const updateBikeAvailability = async (bikeId: string, status: string, reason?: string, unavailableDates?: string[]) => {
        try {
            await bikeService.updateBikeAvailability(bikeId, status, reason, unavailableDates);
            
            // Update the bike in the list
            setBikes(prevBikes => 
                prevBikes.map(bike => 
                    bike.id === bikeId 
                        ? { 
                            ...bike, 
                            availability: { 
                                ...bike.availability, 
                                status,
                                reason, 
                                unavailableDates 
                            } 
                          }
                        : bike
                )
            );
        } catch (err) {
            console.error('Error updating bike availability:', err);
            setError('Failed to update bike availability. Please try again.');
        }
    };

    useEffect(() => {
        fetchBikes();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your bikes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="text-red-800">{error}</div>
                <button 
                    onClick={fetchBikes}
                    className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
    <>
    <div className="min-h-screen bg-gray-50">
    <Header />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20">

        <Inventory 
            Bikes={bikes}
            showDeleteModal={showDeleteModal}
            setShowDeleteModal={setShowDeleteModal}
            bikeToDelete={bikeToDelete}
            setBikeToDelete={setBikeToDelete}
            handleConfirmDelete={handleConfirmDelete}
            isDeleting={isDeleting}
            deleteSuccess={deleteSuccess}
            updateBikeAvailability={updateBikeAvailability}
            onRefresh={fetchBikes}
        />

        </div>
        
        
    </div>
        
        </>
    );
};

export default InventoryPage;