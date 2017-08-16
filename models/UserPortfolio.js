module.exports = (sequelize, DataTypes) => {
    const UserPortfolio = sequelize.define('UserPortfolio', {
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
        pfImage: {
            field: 'pf_image',
            type: DataTypes.STRING,
            allowNull: false
        },
        pfCategory: {
            field: 'pf_category',
            type: DataTypes.STRING,
            allowNull: false
        },
        pfDescription: {
            field: 'pf_description',
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'user_portfolio',
            timestamps: false
        });

    return UserPortfolio;
}