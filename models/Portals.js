import pkg from 'sequelize';
import sequelize from '../config/db.js';

const {Sequelize, DataTypes, Model} = pkg;

class Portals extends Model {
}

Portals.init({
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
    name: {
        type: DataTypes.STRING,
        allowNull: false
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
    modelName: 'portal',
    freezeTableName: true
});

export default Portals;