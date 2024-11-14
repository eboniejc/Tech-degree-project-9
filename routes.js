'use strict';

const express = require('express');
const { authenticateUser } = require('./middleware/auth-user');

// Construct a router instance.
const router = express.Router();
const User = require('./models').User;
const Course = require('./models').Course;

// Handler function to wrap each route.
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
}

// Route that returns a list of users.
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  let users = await User.findAll({
    attributes: ['id', 'firstName', 'lastName', 'emailAddress'] // Only include specified fields
  });
  res.status(200).json(users);
}));

// Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
  try {
    await User.create(req.body);
    res.location('/');
    res.status(201).json({});
  } catch (error) {
    console.log('ERROR: ', error.name);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else {
      throw error;
    }
  }
}));

// Return all courses including the User object associated with each course and a 200 HTTP status code
router.get('/courses', asyncHandler(async (req, res) => {
  let courses = await Course.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },  // Exclude these fields
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'emailAddress']  // Only include specified fields

      },
    ],
  });
  res.status(200).json(courses);
}));


//Return the corresponding course including the User object associated with that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    attributes: { exclude: ['createdAt', 'updatedAt'] },  // Exclude these fields
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'emailAddress']  // Only include specified fields
      },
    ],
  });
  if (course) {
    res.status(200).json(course);
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
}));
//Create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.location(`/api/courses/${course.id}`); // Set the Location header
    res.status(201).end(); // End response with 201 status

  } catch (error) {
    console.log('ERROR: ', error.name);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else {
      throw error;
    }
  }
}));

// Update the corresponding course and return a 204 HTTP status code and no content.

router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (course) {
    if (course.userId === req.currentUser.id) {
      try {
        course.title = req.body.title;
        course.description = req.body.description;
        course.estimatedTime = req.body.estimatedTime;
        course.materialsNeeded = req.body.materialsNeeded;

        await course.save();
        res.status(204).end();
      } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
          const errors = error.errors.map(err => err.message);
          res.status(400).json({ errors });
        } else {
          throw error;
        }
      }
    } else {
      res.status(403).json({ message: "Access Forbidden" });
    }
  } else {
    res.status(404).json({ message: "Course Not Found" });
  }
}));

//Delete the corresponding course and return a 204 HTTP status code and no content.
router.delete("/courses/:id", authenticateUser, asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (course) {
    if (course.userId === req.currentUser.id) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({ message: "Access Forbidden" });
    }
  } else {
    res.status(404).json({ message: "Course Not Found" });
  }
}));

module.exports = router;
