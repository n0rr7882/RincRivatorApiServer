module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        userKey: {
            field: 'user_key',
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
        userPw: {
            field: 'user_pw',
            type: DataTypes.STRING,
            allowNull: false
        },
        salt: {
            field: 'salt',
            type: DataTypes.STRING,
            allowNull: false
        },
        userName: {
            field: 'user_name',
            type: DataTypes.STRING,
            allowNull: false
        },
        profileUrl: {
            field: 'profile_url',
            type: DataTypes.STRING,
            allowNull: false
        },
        phoneNumber: {
            field: 'phone_number',
            type: DataTypes.STRING,
            allowNull: false
        },
        localCity: {
            field: 'local_city',
            type: DataTypes.STRING,
            allowNull: false
        },
        localArea: {
            field: 'local_area',
            type: DataTypes.STRING,
            allowNull: false
        },
        localTown: {
            field: 'local_town',
            type: DataTypes.STRING,
            allowNull: false
        },
        subject: {
            field: 'subject',
            type: DataTypes.STRING,
            allowNull: false
        },
        userStatus: {
            field: 'user_status',
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'user',
            timestamps: false
        });

    return User;
}