require("dotenv").config();
const express = require("express");
const router = express.Router();
const ticketService = require("../service/ticketService");
const employeeService = require("../service/employeeService");
const validateUserMiddleware = require("../middleware/userMiddleware");
const authenticateToken = require("../util/jwt");



router.put("/", validateUserMiddleware, authenticateToken, async (req, res) => {
    const { id, role } = req.body;

    const currRole = await ticketService.getUserRole(req.id);
    
    if(currRole === "employee"){
        return res.status(403).json({message: "You are not authorized to access this functionality!"});
    }

    // console.log("id, newRole: ", id, role);
    const data = await employeeService.updateEmployeeRole(id, role);

    res.status(201).json({message: "Employee Role Updated ", Employee: data});
});


router.get("/", async (req, res) => {
    const data = await employeeService.getAllEmployee();

    res.status(201).json(data);
})


router.get(`/:username`, authenticateToken, async (req, res) => {
    const { username } = req.params;
    const data = await employeeService.getUser(username);

    res.status(201).json(data);
})


router.put(`/:username`, authenticateToken, async (req, res) => {
    const { username } = req.params;
    let { newUsername, newPassword, newAddress } = req.body;
    const user = await employeeService.getUser(username);

    let isUsername = true;
    if(!newUsername){
        isUsername = false;
        newUsername = username;
    }

    let isPassword = true;
    if(!newPassword){
        isPassword = false;
        newPassword = user.password;
    }

    if(!newAddress){
        newAddress = user.address;
    }

    const data = await employeeService.editUserProfile(user.employee_id, newUsername, isUsername, newPassword, isPassword, newAddress);

    if (data.error === "Username already exists") {
        return res.status(400).json({ message: "Username already exists" });
    }

    return res.status(201).json(data);
})


router.put("/:username/profile-picture", authenticateToken, async (req, res) => {
    const { username } = req.params;
    const { profilePicture } = req.body;
    console.log("profile link: ", profilePicture);
    if (!profilePicture) {
        return res.status(400).json({ message: "Profile picture URL is required." });
    }

    const user = await employeeService.getUser(username);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const data = await employeeService.updateProfilePicture(user.employee_id, profilePicture);

    res.status(201).json(data);
});


module.exports = router;