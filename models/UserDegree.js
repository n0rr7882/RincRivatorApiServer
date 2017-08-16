module.exports = (sequelize, DataTypes) => {
    const UserDegree = sequelize.define('UserDegree', {
        _id: {
            field: '_id',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userKey: {
            field: 'user_key',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false
        },
        dgImage: {
            field: 'dg_image',
            type: DataTypes.STRING,
            allowNull: false
        },
        dgCategory: {
            field: 'dg_category',
            type: DataTypes.STRING,
            allowNull: false
        },
        dgDescription: {
            field: 'dg_description',
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'user_degree',
            timestamps: false
        });

    return UserDegree;
}