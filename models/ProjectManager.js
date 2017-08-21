module.exports = (sequelize, DataTypes) => {
    const ProjectManager = sequelize.define('ProjectManager', {
        _id: {
            field: '_id',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        projectKey: {
            field: 'project_key',
            type: DataTypes.INTEGER({ length: 11 }),
            allowNull: false
        },
        userId: {
            field: 'user_id',
            type: DataTypes.STRING,
            allowNull: false
        },
        tmPart: {
            field: 'team_part',
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'project_manager',
            timestamps: false
        });
    return ProjectManager;
}