import pkg from 'sequelize';
import sequelize from '../config/db.js';

const {Sequelize, DataTypes, Model} = pkg;

class Proxies extends Model {
}

Proxies.init({
    proxy_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    protocol_proxy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    host_proxy: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true
    },
    port_proxy: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true
    },
    username_proxy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password_proxy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
        allowNull: false
    },
    fail_request_proxy: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'proxy',
    freezeTableName: true
});

export default Proxies;