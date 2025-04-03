const pool = require("../../config/db");
const bcryptjs = require('bcryptjs');
const { checkPrivilege } = require('../helpers/jwtHelperFunctions')

// Get all users with pagination
const getAllUsers = async (req, res) => {
    try {
      checkPrivilege(req, res, ['Admin']);

        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const [users] = await pool.query("SELECT * FROM users ORDER BY name ASC LIMIT ? OFFSET ?", [limit, offset]);

        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Database query failed" });
      };
    }
};

// get single  user
const getUserByName = async (req, res) => {
  try {
    checkPrivilege(req, res, ['Admin']);

    const searchUser = req.query.name;
    const [user] = await pool.query("SELECT * FROM users WHERE name = ?", [
      searchUser,
    ]);
    if (user.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(user[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Database query failed" });
  };
  }
};

// create new user
const createUser = async (req, res) => {
    try {
      checkPrivilege(req, res, ['Admin']);

        const { name, email, password, phone_number, role_name, dept_name } = req.body;

        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);
        
        const [result] = await pool.query(
            "INSERT INTO users (name, email, password, phone_number, role_name, dept_name) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, hashedPassword, phone_number, role_name, dept_name]
        );
        res.json({ message: "User added", user_id: result.insertId });
    } catch (error) {
        console.error("Error adding user:", error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Database insert failed" });
      }
    }
};

// Update user by ID
const updateUserById = async (req, res) => {
  try {
    checkPrivilege(req, res, ['Admin']);

      const { name, email, phone_number, role_name, dept_name } = req.body;
      const [result] = await pool.query(
          "UPDATE users SET name=?, email=?, phone_number=?, role_name=?, dept_name=? WHERE employee_id=?",
          [name, email, phone_number, role_name, dept_name, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
      res.json({ message: "User updated" });
  } catch (error) {
      console.error("Error updating user:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Database update failed" });
    }
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserByName,
  updateUserById
};
