module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('CourseManager', {
        _id: {
            field: '_id',
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
        courseKey: {
            field: 'course_key',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false
        },
        csStatus: {
            field: 'cs_status',
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'course_manager',
            timestamps: false
        });
    return Course;
}