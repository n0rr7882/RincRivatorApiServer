module.exports = (sequelize, DataTypes) => {
    const Notice = sequelize.define('Notice', {
        noticeKey: {
            field: 'notice_key',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false,
            primaryKey: true,
            autoInCrement: true
        },
        userKey: {
            field: 'user_key',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false
        },
        ntTitle: {
            field: 'nt_title',
            type: DataTypes.STRING,
            allowNull: false
        },
        ntContent: {
            field: 'nt_content',
            type: DataTypes.TEXT,
            allowNull: false
        },
        ntDate: {
            field: 'nt_date',
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'notice',
            timestamps: false
        });
    return Notice;
}