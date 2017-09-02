module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('CourseManager', {
        managerKey: {
            field: 'manager_key',
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
        courseKey: {
            field: 'course_key',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false
        },
        status: {
            field: 'status',
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'course_manager',
            timestamps: true
        });
    return Course;
}