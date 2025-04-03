const pool = require("../../config/db");
const { checkPrivilege } = require('../helpers/jwtHelperFunctions');

// Get all trucks with pagination
const getAllTrucks = async (req, res) => {
    try {
        checkPrivilege(req, res, ['Admin','Warehouse']);

        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const [trucks] = await pool.query("SELECT * FROM Trucks ORDER BY license_plate ASC LIMIT ? OFFSET ?", [limit, offset]);

        res.json(trucks);
    } catch (error) {
        console.error("Error fetching trucks:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Database query failed" });
        }
    }
};

// Get available trucks
const getAvailableTrucks = async (req, res) => {
    try {
        checkPrivilege(req, res, ['Admin','Warehouse']);

        const [trucks] = await pool.query("SELECT * FROM Trucks WHERE status = 'available'");
        res.json(trucks);
    } catch (error) {
        console.error("Error fetching available trucks:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Database query failed" });
        }
    }
};

// Get available trucks based on delivery status
const getAvailableTrucksTanglement = async (req, res) => {
    try {
        checkPrivilege(req, res, ['Admin', 'Warehouse']);

        const [trucks] = await pool.query(`
            SELECT T.*
            FROM Trucks T
            LEFT JOIN Deliveries D ON T.truck_id = D.truck_id AND D.status = 'delivering'
            WHERE D.truck_id IS NULL
        `);

        res.json(trucks);
    } catch (error) {
        console.error("Error fetching available trucks based on delivery status:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Database query failed" });
        }
    }
};

// Get single truck by license plate
const getTruckByLicensePlate = async (req, res) => {
    try {
        checkPrivilege(req, res, ['Admin','Warehouse']);

        const searchLicensePlate = req.query.license_plate;
        const [truck] = await pool.query("SELECT * FROM Trucks WHERE license_plate = ?", [searchLicensePlate]);
        if (truck.length === 0) return res.status(404).json({ error: "Truck not found" });
        res.json(truck[0]);
    } catch (error) {
        console.error("Error fetching truck:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Database query failed" });
        }
    }
};

// Create new truck
const createTruck = async (req, res) => {
    try {
        checkPrivilege(req, res, ['Admin','Warehouse']);

        const { license_plate } = req.body;
        const [result] = await pool.query(
            "INSERT INTO Trucks (license_plate) VALUES (?)",
            [license_plate]
        );
        res.json({ message: "Truck added", truck_id: result.insertId });
    } catch (error) {
        console.error("Error adding truck:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Database Insert Failed" });
        }
    }
};

// Update truck
const updateTruck = async (req, res) => {
    try {
        checkPrivilege(req, res, ['Admin','Warehouse']);

        const { truck_id, license_plate } = req.body;
        const [result] = await pool.query(
            "UPDATE Trucks SET license_plate = ? WHERE truck_id = ?",
            [license_plate, truck_id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Truck not found" });
        res.json({ message: "Truck updated" });
    } catch (error) {
        console.error("Error updating truck:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Database Update Failed" });
        }
    }
};

// Delete truck
const deleteTruck = async (req, res) => {
    try {
        checkPrivilege(req, res, ['Admin','Warehouse']);

        const { truck_id } = req.body;
        const [result] = await pool.query("DELETE FROM Trucks WHERE truck_id = ?", [truck_id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Truck not found" });
        res.json({ message: "Truck deleted" });
    } catch (error) {
        console.error("Error deleting truck:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Database Delete Failed" });
        }
    }
};

module.exports = {
    getAllTrucks,
    getTruckByLicensePlate,
    createTruck,
    updateTruck,
    deleteTruck,
    getAvailableTrucks,
    getAvailableTrucksTanglement
};