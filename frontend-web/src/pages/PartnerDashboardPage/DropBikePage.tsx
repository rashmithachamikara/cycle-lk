import { useState } from "react";

const DropBikePage = () => {
    const [bikeId, setBikeId] = useState("");

    const handleDropOff = () => {
        // Logic for dropping off the bike
    };

    return (
        <div>
            <h1>Drop Off a Bike</h1>
            <input
                type="text"
                value={bikeId}
                onChange={(e) => setBikeId(e.target.value)}
                placeholder="Enter Bike ID"
            />
            <button onClick={handleDropOff}>Drop Off</button>
        </div>
    );
};
export default DropBikePage;