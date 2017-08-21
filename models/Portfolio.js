module.exports = (sequelize, DataTypes) => {
    const Portfolio = sequelize.define('Portfolio', {
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
        portfolioTitle: {
            field: 'portfolio_title',
            type: DataTypes.STRING,
            allowNull: false
        },
        portfolioDescription: {
            field: 'portfolio_description',
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
            timestamps: false
        });

    return Portfolio;
}