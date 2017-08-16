module.exports = (sequelize, DataTypes) => {
    const Contest = sequelize.define('Contest', {
        contestKey: {
            field: 'contest_key',
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
        ctImage1: {
            field: 'ct_image1',
            type: DataTypes.STRING,
            allowNull: false
        },
        ctImage2: {
            field: 'ct_image2',
            type: DataTypes.STRING,
            allowNull: false
        },
        ctImage3: {
            field: 'ct_image3',
            type: DataTypes.STRING,
            allowNull: false
        },
        ctPriseNum: {
            field: 'ct_prise_num',
            type: DataTypes.STRING,
            allowNull: false
        },
        ctDescription: {
            field: 'ct_description',
            type: DataTypes.TEXT,
            allowNull: false
        },
        ctFieldEntry: {
            field: 'ct_field_entry',
            type: DataTypes.STRING,
            allowNull: false
        },
        ctCriteria: {
            field: 'ct_criteria',
            type: DataTypes.STRING,
            allowNull: false
        },
        ctAward: {
            field: 'ct_award',
            type: DataTypes.TEXT,
            allowNull: false
        },
        ctDateStart: {
            field: 'ct_date_start',
            type: DataTypes.DATE,
            allowNull: false
        },
        ctDateEnd: {
            field: 'ct_date_end',
            type: DataTypes.DATE,
            allowNull: false
        },
        ctStatus: {
            field: 'ct_status',
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
            underscored: true,
            freezeTableName: true,
            tableName: 'contest',
            timestamps: false
        });
    return Contest;
}