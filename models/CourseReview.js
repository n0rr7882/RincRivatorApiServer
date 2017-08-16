module.exports = (sequelize, DataTypes) => {
    const CourseReview = sequelize.define('CourseReview', {
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
        csScore: {
            field: 'cs_score',
            type: DataTypes.FLOAT,
            allowNull: false
        },
        csContent: {
            field: 'cs_content',
            type: DataTypes.TEXT,
            allowNull: false
        },
        csDate: {
            field: 'cs_date',
            type: DataTypes.DATE,
            allowNull: false
        },
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'course_review',
            timestamps: false
        });
    return CourseReview;
}