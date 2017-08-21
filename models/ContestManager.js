module.exports = (sequelize, DataTypes) => {
    const ContestManager = sequelize.define('ContestManager', {
        _id: {
            field: '_id',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            field: 'user_id',
            type: DataTypes.STRING,
            allowNull: false
        },
        contestKey: {
            field: 'contest_key',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'contest_manager',
            timestamps: false
        });
    return ContestManager;
}