module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define('Project', {
        projectKey: {
            field: 'project_key',
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
        pjImage1: {
            field: 'pj_image1',
            type: DataTypes.STRING,
            allowNull: false
        },
        pjImage2: {
            field: 'pj_image2',
            type: DataTypes.STRING,
            allowNull: false
        },
        pjImage3: {
            field: 'pj_image3',
            type: DataTypes.STRING,
            allowNull: false
        },
        pjImage3: {
            field: 'pj_image3',
            type: DataTypes.STRING,
            allowNull: false
        },
        pjTitle: {
            field: 'pj_title',
            type: DataTypes.STRING,
            allowNull: false
        },
        pjDate: {
            field: 'pj_date',
            type: DataTypes.DATE,
            allowNull: false
        },
        pjTeamName: {
            field: 'pj_team_name',
            type: DataTypes.STRING,
            allowNull: false
        },
        pjCategory: {
            field: 'pj_category',
            type: DataTypes.STRING,
            allowNull: false
        },
        pjMemberNum: {
            field: 'pj_member_num',
            type: DataTypes.INTEGER,
            allowNull: false
        },
        pjDescription: {
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