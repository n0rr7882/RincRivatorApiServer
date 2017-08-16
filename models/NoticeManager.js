module.exports = (sequelize, DataTypes) => {
    const NoticeManager = sequelize.define('NoticeManager', {
        _id: {
            field: '_id',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false,
            primaryKey: true,
            autoInCrement: true
        },
        noticeKey: {
            field: 'notice_key',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false
        },
        userKey: {
            field: 'user_key',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false
        },
        isRead: {
            field: 'is_read',
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'notice_manager',
            timestamps: false
        });
    return NoticeManager;
}