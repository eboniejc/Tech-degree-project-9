'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');
const sequelize = require('./models').sequelize; // import Sequelize

// create the Express app
const app = express();

// Setup request body JSON parsing.
app.use(express.json());

// Setup morgan which gives us HTTP request logging.
app.use(morgan('dev'));


//database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been successfully established .');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// Add routes.
app.use('/api', routes);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  // if () {
  //   console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  // }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
