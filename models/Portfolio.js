const models = require('./index');

module.exports = (sequelize, DataTypes) => {
    const Portfolio = sequelize.define('Portfolio', {
        portfolioKey: {
            field: 'portfolio_key',
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
        title: {
            field: 'title',
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            field: 'description',
            type: DataTypes.TEXT,
            allowNull: false
        },
        portfolioFile: {
            field: 'portfolio_file',
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'portfolio',
            timestamps: true
        });

    return Portfolio;
}