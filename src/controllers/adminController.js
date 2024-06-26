var adminService = require('../services/adminService')

let handleGetUserById = async (req, res) => {
    let id = req.params.id;
    if (!id) {
        return res.status(400).json({
            errCode: 1,
            message: 'Missing required parameter!',
            user: {}
        })
    }
    let user = await adminService.getUserById(id);
    return res.status(200).json({
        errCode: 0,
        message: 'OK',
        user
    })
}

let handleGetAllUsers = async (req, res) => {
    let users = await adminService.getAllUsers();
    return res.status(200).json({
        errCode: 0,
        message: 'OK',
        users
    })
}

let handleCreateNewUser = async (req, res) => {
    let message = await adminService.createNewUser(req.body);
    if (message.errCode !== 0) {
        return res.status(400).json(message)
    } else {
        return res.status(201).json(message)
    }

}

let handleUpdateUser = async (req, res) => {
    let message = await adminService.updateUser(req.body);
    return res.status(200).json(message)
}

let handleDeleteUser = async (req, res) => {
    let message = await adminService.deleteUser(req.body, req.query);
    return res.status(200).json(message)
}

let handleGetDiamonds = async (req, res) => {
    let diamonds = await adminService.getDiamonds();
    return res.status(200).json({
        errCode: 0,
        message: 'OK',
        diamonds
    })
}

let handleGetRequests = async (req, res) => {
    let requests = await adminService.getRequests();
    return res.status(200).json({
        errCode: 0,
        message: 'OK',
        requests
    })
}

let handleGetResults = async (req, res) => {
    let results = await adminService.getResults();
    return res.status(200).json({
        errCode: 0,
        message: 'OK',
        results
    })
}

let handleCountUser = async (req, res) => {
    let count = await adminService.countUser();
    return res.status(200).json({
        errCode: 0,
        message: 'OK',
        count
    })
}
let handleCountDiamond = async (req, res) => {
    let count = await adminService.countDiamond();
    return res.status(200).json({
        errCode: 0,
        message: 'OK',
        count
    })
}

let handleGetRequestById = async (req, res) => {
    let id = req.params.id;
    if (!id) {
        return res.status(400).json({
            errCode: 1,
            message: 'Missing required parameter!',
            request: {}
        })
    }
    let request = await adminService.getRequestById(id);
    return res.status(200).json({
        errCode: 0,
        message: 'OK',
        request
    })
}

let handleCountRequest = async (req, res) => {
    let count = await adminService.countRequest();
    return res.status(200).json({
        errCode: 0,
        message: 'OK',
        count
    })
}

let handleGetProfit = async (req, res) => {
    let profit = await adminService.getProfit();
    return res.status(200).json({
        errCode: 0,
        message: 'OK',
        profit
    })
}
module.exports = {
    handleGetAllUsers: handleGetAllUsers,
    handleGetUserById: handleGetUserById,
    handleCreateNewUser: handleCreateNewUser,
    handleUpdateUser: handleUpdateUser,
    handleDeleteUser: handleDeleteUser,
    handleGetDiamonds: handleGetDiamonds,
    handleGetRequests: handleGetRequests,
    handleGetResults: handleGetResults,
    handleCountUser: handleCountUser,
    handleCountDiamond: handleCountDiamond,
    handleGetRequestById: handleGetRequestById,
    handleCountRequest: handleCountRequest,
    handleGetProfit: handleGetProfit,
}