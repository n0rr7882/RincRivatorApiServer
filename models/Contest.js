module.exports = (sequelize, DataTypes) => {
    const Contest = sequelize.define('Contest', {
        contestKey: {
            field: 'contest_key',
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
        priseNum: {
            field: 'prise_num',
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            field: 'description',
            type: DataTypes.TEXT,
            allowNull: false
        },
        fieldEntry: {
            field: 'field_entry',
            type: DataTypes.STRING,
            allowNull: false
        },
        criteria: {
            field: 'criteria',
            type: DataTypes.STRING,
            allowNull: false
        },
        award: {
            field: 'award',
            type: DataTypes.TEXT,
            allowNull: false
        },
        dateStart: {
            field: 'date_start',
            type: DataTypes.DATE,
            allowNull: false
        },
        dateEnd: {
            field: 'date_end',
            type: DataTypes.DATE,
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
            tableName: 'contest',
            timestamps: true
        });
    return Contest;
}