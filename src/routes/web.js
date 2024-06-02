const express = require('express');
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const staffController = require('../controllers/staffController');
const { verifyToken, verifyAdmin, verifyStaff } = require('../middleware/auth');

let router = express.Router();

let initWebRoutes = (app) => {
    // user api
    router.post("/login", userController.handleLogin);
    router.post("/register", userController.handleRegister);
    router.post("/createNewRequest", verifyToken, userController.handleCreateNewRequest);

    // staff api
    router.put("/changeProcess/:id", verifyToken, staffController.handleChangeProcess);
    router.put("/valuation/:id", verifyToken, staffController.handleValuation);

    // admin api
    router.get("/users/:id", verifyToken, adminController.handleGetUserById);
    router.get("/users", verifyToken, adminController.handleGetAllUsers);
    router.get("/countUser", verifyToken, adminController.handleCountUser);
    router.post("/users", verifyToken, adminController.handleCreateNewUser);
    router.put("/users", verifyToken, adminController.handleUpdateUser);
    router.put("/deleteUser", verifyToken, adminController.handleDeleteUser);
    router.get("/diamonds", verifyToken, adminController.handleGetDiamonds);
    router.get("/countDiamond", verifyToken, adminController.handleCountDiamond);
    router.get("/requests", verifyToken, adminController.handleGetRequests);
    router.get("/requests/:id", verifyToken, adminController.handleGetRequestById);
    router.get("/countRequest", verifyToken, adminController.handleCountRequest);
    router.get("/results", verifyToken, adminController.handleGetResults);
    router.get("/profit", verifyToken, adminController.handleGetProfit);
    router.get("/icon", (req, res) => {
        res.send('😀😃😄😁😆😅🤣😂');
    });

    return app.use("/api", router);
};

module.exports = initWebRoutes;
