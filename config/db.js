import mysql2 from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const db = mysql2;

export default db.createPool({
        host     : process.env.MYSQL_HOST,
        user     : process.env.MYSQL_USER,
        password : process.env.MYSQL_PASS,
        database : process.env.MYSQL_NAME
    });