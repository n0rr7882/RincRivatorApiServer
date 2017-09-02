module.exports = (sequelize, DataTypes) => {
    const CourseReview = sequelize.define('CourseReview', {
        reviewKey: {
            field: 'review_key',
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
        score: {
            field: 'score',
            type: DataTypes.FLOAT,
            allowNull: false
        },
        content: {
            field: 'content',
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'course_review',
            timestamps: true
        });
    return CourseReview;
}