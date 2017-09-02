module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('Course', {
        courseKey: {
            field: 'course_key',
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
        category: {
            field: 'category',
            type: DataTypes.STRING,
            allowNull: false
        },
        unit: {
            field: 'unit',
            type: DataTypes.INTEGER,
            allowNull: false
        },
        score: {
            field: 'score',
            type: DataTypes.FLOAT,
            allowNull: false
        },
        price: {
            field: 'price',
            type: DataTypes.INTEGER,
            allowNull: false
        },
        isOpen: {
            field: 'is_open',
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        curriculum: {
            field: 'curriculum',
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'course',
            timestamps: true
        });
    return Course;
}