import Sequelize from 'sequelize';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

/*
const db = mysql2;

export default db.createPool({
        host     : process.env.MYSQL_HOST,
        user     : process.env.MYSQL_USER,
        password : process.env.MYSQL_PASS,
        database : process.env.MYSQL_NAME
    });*/


const sequelize = new Sequelize(process.env.MYSQL_NAME, process.env.MYSQL_USER, process.env.MYSQL_PASS, {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: false
});

export default sequelize;