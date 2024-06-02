const sql = require('mssql');
require('dotenv').config();

const dbConnect = async () => {
    try {
        const pool = await sql.connect({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            options: {
                encrypt: true, // Use this if you're on Windows Azure
                enableArithAbort: true
            }
        });
        return pool;
    } catch (err) {
        console.error('Database connection failed!', err);
        throw err;
    }
};

module.exports = dbConnect;
