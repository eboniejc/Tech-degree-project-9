'use strict';

const auth = require('basic-auth');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * Middleware to authenticate the request using Basic Authentication.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {Function} next - The function to call to pass execution to the next middleware.
 */
exports.authenticateUser = async (req, res, next) => {
  let message;

  try {
    const credentials = auth(req);

    if (credentials) {
      const user = await User.findOne({ where: { emailAddress: credentials.name } });
      if (user) {
        const authenticated = bcrypt.compareSync(credentials.pass, user.password);

        if (authenticated) {
          console.log(`Authentication successful for ${user.firstName} ${user.lastName}`);

          // Store the user on the Request object.
          req.currentUser = user;
          next(); // Allow the request to proceed
        } else {
          message = `Authentication failure for ${user.firstName} ${user.lastName}`;
          res.status(401).json({ message: 'Access Denied' });
        }
      } else {
        message = `User not found for email: ${credentials.name}`;
        res.status(401).json({ message: 'Access Denied' });
      }
    } else {
      message = 'Auth header not found';
      res.status(401).json({ message: 'Access Denied' });
    }
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
