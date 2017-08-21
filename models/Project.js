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
        projectTitle: {
            field: 'project_title',
            type: DataTypes.STRING,
            allowNull: false
        },
        projectDate: {
            field: 'project_date',
            type: DataTypes.DATE,
            allowNull: false
        },
        projectTeamName: {
            field: '_team_name',
            type: DataTypes.STRING,
            allowNull: false
        },
        projectCategory: {
            field: 'pj_category',
            type: DataTypes.STRING,
            allowNull: false
        },
        projectMemberNum: {
            field: 'pj_member_num',
            type: DataTypes.INTEGER,
            allowNull: false
        },
        projectDescription: {
            field: 'pj_description',
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'project',
            timestamps: false
        });
    return Project;
}