var bcrypt = require('bcryptjs');
var config = require('../config/dbconfig');
const sql = require("mssql");
const salt = bcrypt.genSaltSync(10);


let checkUserName = (username) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);
            let user = await pool.request().query("SELECT username FROM Account WHERE username = '" + username + "'");
            if (user.recordset.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getUserById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);
            const user = await pool.request().query(`
          SELECT ac.id, ac.username, ac.firstName, ac.lastName, ac.email, ac.phone, ac.createdAt, ac.status, ac.roleId
          FROM Account as ac
          JOIN Role as r ON ac.roleId = r.id
          WHERE ac.id = ${id}
        `);
            resolve(user.recordset);
        } catch (error) {
            reject(error);
        }
    });
};

const getAllUsers = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);
            const users = await pool.request().query(`
          SELECT ac.id, ac.username, ac.firstName, ac.lastName, ac.email, ac.phone, ac.createdAt, ac.status, name as role
          FROM Account as ac
          JOIN Role as r ON ac.roleId = r.id
          ORDER BY ac.createdAt DESC
        `);
            resolve(users.recordset);
        } catch (error) {
            reject(error);
        }
    });
};

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let isExist = await checkUserName(data.username);
            if (isExist) {
                resolve({
                    errCode: 1,
                    message: 'Username exist try another username!'
                });
            } else {
                if (data.password.length < 6) {
                    resolve({
                        errCode: 2,
                        message: 'Password must be at least 6 characters'
                    });
                }
                const pool = await sql.connect(config);
                const hashedPassword = await hashUserPassword(data.password)
                const request = pool.request();
                request.input('username', sql.NVarChar, data.username);
                request.input('password', sql.NVarChar, hashedPassword);
                request.input('firstName', sql.NVarChar, data.firstName);
                request.input('lastName', sql.NVarChar, data.lastName);
                request.input('email', sql.NVarChar, data.email);
                request.input('phone', sql.NVarChar, data.phone);
                request.input('createdAt', sql.DateTime, new Date());
                request.input('status', sql.Int, 1);
                request.input('roleId', sql.Int, data.roleId);

                await request.query(`
                 INSERT INTO Account (username, password, firstName, lastName, email, phone, createdAt, status, roleId)
                 VALUES (@username, @password, @firstName, @lastName, @email, @phone, @createdAt, @status, @roleId)
                 `);

                resolve({
                    errCode: 0,
                    message: 'Create new user success'
                });
            }
        } catch (error) {
            reject(error);
        }
    });
}

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (error) {
            reject(error);
        }
    });
}

let updateUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);
            const hashedPassword = data.password ? await hashUserPassword(data.password) : null;

            const request = pool.request();
            request.input('username', sql.NVarChar, data.username);
            let currentUserResult = await request.query(`SELECT * FROM Account WHERE username = @username`);
            let currentUser = currentUserResult.recordset[0];

            if (!currentUser) {
                return reject({
                    errCode: 1,
                    message: 'User not found'
                });
            }

            const updatedData = {
                password: hashedPassword ? hashedPassword : currentUser.password,
                status: data.status !== undefined ? data.status : currentUser.status,
                roleId: data.roleId !== undefined ? data.roleId : currentUser.roleId,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email ? data.email : '',
                phone: data.phone ? data.phone : ''
            };

            request.input('password', sql.NVarChar, updatedData.password);
            request.input('firstName', sql.NVarChar, updatedData.firstName);
            request.input('lastName', sql.NVarChar, updatedData.lastName);
            request.input('email', sql.NVarChar, updatedData.email);
            request.input('phone', sql.NVarChar, updatedData.phone);
            request.input('status', sql.Int, updatedData.status);
            request.input('roleId', sql.Int, updatedData.roleId);

            await request.query(`
                UPDATE Account 
                SET password = @password, firstName = @firstName, lastName = @lastName, email = @email, phone = @phone, status = @status, roleId = @roleId
                WHERE username = @username
            `);

            resolve({
                errCode: 0,
                message: 'Update user success'
            });
        } catch (error) {
            reject(error);
        }
    });
};

let deleteUser = (data, query) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);

            // Truy xuất dữ liệu hiện tại của người dùng
            const request = pool.request();
            request.input('username', sql.NVarChar, query.username);
            let currentUserResult = await request.query(`SELECT * FROM Account WHERE username = @username`);
            let currentUser = currentUserResult.recordset[0];

            if (!currentUser) {
                return resolve({
                    errCode: 1,
                    message: 'User not found'
                });
            }

            request.input('status', sql.Int, data.status);
            await request.query(`
                UPDATE Account 
                SET status = @status
                WHERE username = @username
            `);
            resolve({
                errCode: 0,
                message: 'Delete user success'
            });
        } catch (error) {
            reject(error);
        }
    });
}

let getDiamonds = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);
            const diamonds = await pool.request().query(`
            SELECT id, proportions, diamondOrigin, caratWeight, measurements, polish, flourescence, color, cut, clarity, symmetry
            FROM Diamond;
        `);
            resolve(diamonds.recordset);
        } catch (error) {
            reject(error);
        }
    });
}

let getRequests = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);
            const requests = await pool.request().query(`
            SELECT r.id AS RequestID, r.requestImage, r.note, r.createdDate, r.updatedDate, d.id
            AS DiamondID, d.proportions, d.diamondOrigin, d.caratWeight, d.measurements, d.polish, d.flourescence,d.color,d.cut, d.clarity,d.symmetry,d.shape,
            a.id AS UserID, a.username, a.firstName, a.lastName, a.email, a.phone,
            p.id AS ProcessID, p.processStatus,
            s.id AS ServiceID, s.serviceName
            FROM
              Request r
            JOIN Diamond d ON r.diamondId = d.id
            JOIN Account a ON r.userId = a.id
            JOIN Process p ON r.processId = p.id
            JOIN Service s ON r.serviceId = s.id
            ORDER BY r.createdDate DESC;
        `);
            resolve(requests.recordset);
        } catch (error) {
            reject(error);
        }
    });
}

let getResults = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);
            const results = await pool.request().query(`
            SELECT  res.id AS ResultID, res.price, res.companyName, res.dateValued, 
            req.id AS RequestID, req.requestImage, req.note, req.createdDate, req.updatedDate,
            dia.id AS DiamondID, dia.proportions, dia.diamondOrigin, dia.caratWeight, dia.measurements, dia.polish, dia.flourescence, dia.color, dia.cut, dia.clarity, dia.symmetry, dia.shape, 
            acc.id AS AccountID, acc.username, acc.firstName, acc.lastName, acc.email, acc.phone,
            pro.id AS ProcessID, pro.processStatus,
            ser.id AS ServiceID, ser.servicePrice , ser.serviceName
            FROM 
                Result res
            JOIN 
                Request req ON res.requestId = req.id
            JOIN 
                Diamond dia ON req.diamondId = dia.id
            JOIN 
                Account acc ON req.userId = acc.id
            JOIN 
                Process pro ON req.processId = pro.id
            JOIN
                Service ser ON req.serviceId = ser.id
            ORDER BY res.dateValued DESC;
        `);
            resolve(results.recordset);
        } catch (error) {
            reject(error);
        }
    });
}


let countUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);
            const count = await pool.request().query(`
            SELECT COUNT(id) AS count FROM Account;
        `);
            resolve(count.recordset[0].count);
        } catch (error) {
            reject(error);
        }
    });
}

let getRequestById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);
            const request = await pool.request().query(`
            SELECT r.id AS RequestID, r.requestImage, r.note, r.createdDate, r.updatedDate, 
            d.id AS DiamondID, d.proportions, d.diamondOrigin, d.caratWeight, d.measurements, d.polish, d.flourescence, d.color, d.cut, d.clarity, d.symmetry, d.shape,
            a.id AS UserID, a.username, a.firstName, a.lastName, a.email, a.phone,
            p.id AS ProcessID, p.processStatus,
            s.id AS ServiceID, s.serviceName
            FROM Request r
            JOIN Diamond d ON r.diamondId = d.id
            JOIN Account a ON r.userId = a.id
            JOIN Process p ON r.processId = p.id
            JOIN Service s ON r.serviceId = s.id
            WHERE r.id = ${id};
        `);
            resolve(request.recordset);
        } catch (error) {
            reject(error);
        }
    });
}

let countDiamond = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);
            const count = await pool.request().query(`
            SELECT COUNT(id) AS count FROM Diamond;
        `);
            resolve(count.recordset[0].count);
        } catch (error) {
            reject(error)
        }
    });
}

let countRequest = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);
            const count = await pool.request().query(`
            SELECT COUNT(id) AS count FROM Request;
        `);
            resolve(count.recordset[0].count);
        } catch (error) {
            reject(error)
        }
    })
}

let getProfit = async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await sql.connect(config);
            const profit = await pool.request().query(`
            SELECT  SUM(servicePrice) AS profit
            FROM
                Result res
            JOIN
                Request req ON res.requestId = req.id
            JOIN
                Service ser ON req.serviceId = ser.id
        `);
            resolve(profit.recordset[0].profit);
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    checkUserName: checkUserName,
    getUserById: getUserById,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    hashUserPassword: hashUserPassword,
    updateUser: updateUser,
    deleteUser: deleteUser,
    getDiamonds: getDiamonds,
    getRequests: getRequests,
    getResults: getResults,
    countUser: countUser,
    countDiamond: countDiamond,
    getRequestById: getRequestById,
    countRequest: countRequest,
    getProfit: getProfit,
}
