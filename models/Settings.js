import pkg from 'sequelize';
import sequelize from '../config/db.js';

const {Sequelize, DataTypes, Model} = pkg;

class Settings extends Model {
}

Settings.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    alias: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true
    },
    is_active: {
        type: DataTypes.STRING,
        defaultValue: 1,
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
    modelName: 'settings',
    freezeTableName: true
});

export default Settings;