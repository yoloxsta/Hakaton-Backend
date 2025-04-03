const express = require('express');
// const { query, validationResult } = require('express-validator');
// const connection = require('../db/connection');
const { 
    getAllUsers, 
    createUser, 
    getUserByName,
    updateUserById 
} = require("../controllers/userController");

const router = express.Router();

router.get("/searchUser", getUserByName); // GET /api/users/searchUser?=username
router.get("/", getAllUsers); // GET /api/users?limit=100&offset=0
router.post("/", createUser);
router.put('/:id', updateUserById)
module.exports = router;