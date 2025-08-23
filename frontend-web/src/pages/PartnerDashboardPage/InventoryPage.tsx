import { useEffect, useState } from "react";
import { Bike } from "../../services/bikeService";
import {getPartnerBikes} from "../../services/partnerService";
import Inventory from "../../components/PartnerDashboard/Inventory";

const InventoryPage = () => {
    const [bikes, setBikes] = useState<Bike[]>([]);

    useEffect(() => {
        const fetchBikes = async () => {
            const bikeList = await getPartnerBikes();
            setBikes(bikeList);
        };

        fetchBikes();
    }, []);

    return <Inventory Bikes={bikes} />;
}