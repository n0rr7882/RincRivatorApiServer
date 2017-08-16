module.exports = (sequelize, DataTypes) => {
    const ProjectTeamMember = sequelize.define('ProjectTeamMember', {
        _id: {
            field: '_id',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false,
            primaryKey: true,
            autoInCrement: true
        },
        projectKey: {
            field: 'project_key',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false
        },
        userKey: {
            field: 'user_key',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false
        },
        tmPart: {
            field: 'tm_part',
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'project_team_member',
            timestamps: false
        });
    return ProjectTeamMember;
}