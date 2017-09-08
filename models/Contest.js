module.exports = (sequelize, DataTypes) => {
    const Contest = sequelize.define('Contest', {
        contestKey: {
            field: 'contest_key',
            type: DataTypes.INTEGER,
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
        priseNum: {
            field: 'prise_num',
            type: DataTypes.INTEGER,
            allowNull: false
        },
        description: {
            field: 'description',
            type: DataTypes.TEXT,
            allowNull: false
        },
        fieldEntry: {
            field: 'field_entry',
            type: DataTypes.TEXT,
            allowNull: false
        },
        criteria: {
            field: 'criteria',
            type: DataTypes.TEXT,
            allowNull: false
        },
        award: {
            field: 'award',
            type: DataTypes.TEXT,
            allowNull: false
        },
        dateStart: {
            field: 'start_time',
            type: DataTypes.DATE,
            allowNull: false
        },
        dateEnd: {
            field: 'end_time',
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'contest',
            timestamps: true
        });
    return Contest;
}