module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('Course', {
        courseKey: {
            field: 'course_key',
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
        courseTitle: {
            field: 'course_title',
            type: DataTypes.STRING,
            allowNull: false
        },
        courseCategory: {
            field: 'course_category',
            type: DataTypes.STRING,
            allowNull: false
        },
        courseUnit: {
            field: 'course_unit',
            type: DataTypes.INTEGER,
            allowNull: false
        },
        courseScore: {
            field: 'course_score',
            type: DataTypes.FLOAT,
            allowNull: false
        },
        coursePrice: {
            field: 'course_price',
            type: DataTypes.INTEGER,
            allowNull: false
        },
        courseCurriculum: {
            field: 'course_curriculum',
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'course',
            timestamps: false
        });
    return Course;
}