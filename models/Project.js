const models = require('./index');

module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define('Project', {
        projectKey: {
            field: 'project_key',
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
        date: {
            field: 'date',
            type: DataTypes.DATE,
            allowNull: false
        },
        teamName: {
            field: 'team_name',
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            field: 'category',
            type: DataTypes.STRING,
            allowNull: false
        },
        memberNum: {
            field: 'member_num',
            type: DataTypes.INTEGER,
            allowNull: false
        },
        description: {
            field: 'description',
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'project',
            timestamps: true
        });
    return Project;
}