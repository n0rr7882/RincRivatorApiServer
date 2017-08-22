'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/sequelize.json')[env];
var db = {};

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function (file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

/* accosiation */

// user can have a user portfolio
db.Portfolio.hasOne(db.User, { foreignKey: { name: 'userId', allowNull: false } });

// user can open many contests
db.User.hasMany(db.Contest, { foreignKey: { name: 'userId', allowNull: false } });
// contest can have many contest managers
db.Contest.hasMany(db.ContestManager, { foreignKey: { name: 'contestKey', allowNull: false } });
// user can join many contests
db.User.hasMany(db.ContestManager, { foreignKey: { name: 'userId', allowNull: false } });

// user can open many courses
db.User.hasMany(db.Course, { foreignKey: { name: 'userId', allowNull: false } });
// course can have many course managers
db.Course.hasMany(db.CourseManager, { foreignKey: { name: 'courseKey', allowNull: false } });
// user can join many courses
db.User.hasMany(db.CourseManager, { foreignKey: { name: 'userId', allowNull: false } });
// course can have many course reviews
db.Course.hasMany(db.CourseReview, { foreignKey: { name: 'courseKey', allowNull: false } });
// user can write many course reviews
db.User.hasMany(db.CourseReview, { foreignKey: { name: 'userId', allowNull: false } });

// user can write many notices
db.User.hasMany(db.Notice, { foreignKey: { name: 'userId', allowNull: false } });
// notice can have many notice managers
db.Notice.hasMany(db.NoticeManager, { foreignKey: { name: 'noticeKey', allowNull: false } });

// user can make many projects
db.User.hasMany(db.Project, { foreignKey: { name: 'userId', allowNull: false } });
// project can have many project team members
db.Project.hasMany(db.ProjectManager, { foreignKey: { name: 'projectKey', allowNull: false } });
// user can join many projects
db.User.hasMany(db.ProjectManager, { foreignKey: { name: 'userId', allowNull: false } });

module.exports = db;
