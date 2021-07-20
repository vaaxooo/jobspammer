import pkg from 'sequelize';
import sequelize from '../config/db.js';

const {Sequelize, DataTypes, Model} = pkg;

class Orders extends Model {
}

Orders.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    portal: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_name: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true
    },
    last_name: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
        allowNull: false
    },
    status_order: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
        allowNull: false
    },
    target_link: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    file_mailing: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    all_links: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
        allowNull: false
    },
    send_links: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
        allowNull: false
    },
    fail_links: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING(5000),
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
    modelName: 'order',
    freezeTableName: true
});

export default Orders;