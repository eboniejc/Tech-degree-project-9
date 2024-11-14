'use strict';
const Sequelize = require('sequelize');

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Sequelize.Model { }
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A first name is required'
        },
        notEmpty: {
          msg: 'Please provide a first name'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A last name is required'
        },
        notEmpty: {
          msg: 'Please provide a last name'
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'The email you entered already exists'
      },
      validate: {
        notNull: {
          msg: 'An email is required'
        },
        isEmail: {
          msg: 'Please provide a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      // type: DataTypes.VIRTUAL,  if i need to confirm later
      allowNull: false,
      set(val) {  // Hash the password before saving it to the database
        if (val) {
          const hashedPassword = bcrypt.hashSync(val, 10);
          this.setDataValue('password', hashedPassword);
        }
      },
      validate: {
        notNull: {
          msg: 'A password is required'
        },
        notEmpty: {
          msg: 'Please provide a password'
        }
        // len: {
        //   args: [8, 20],
        //   msg: 'The password should be between 8 and 20 characters in length'
        // }
      }
    }
    // confirmedPassword: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   set(val) {
    //     if ( val === this.password ) {
    //       const hashedPassword = bcrypt.hashSync(val, 10);
    //       this.setDataValue('confirmedPassword', hashedPassword);
    //     }
    //   },
    //   validate: {
    //     notNull: {
    //       msg: 'Both passwords must match'
    //     }
    //   }
    // } keep might need later
  }, {
    sequelize,
    modelName: 'User',
  });
  User.associate = (models) => {
    User.hasMany(models.Course, {
      foreignKey: {
        fieldName: 'userId',
      },
    });
  }

  return User;
};