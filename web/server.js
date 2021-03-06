
const RESTART_INTERVAL = 1000 * 60 * 60 * 24 * 3; // every 3 days

const app = require('./app');
const debug = require('debug')('slack-autotranslator:server');
const https = require('https');
const http = require('http');
const fs = require('fs');

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Create HTTP or HTTPS server depending on environment
var server;

function createServer() {
  if (process.env.PRODUCTION && process.env.PRODUCTION.toLowerCase() === 'true') {

    if (!process.env.SSL_KEY || !process.env.SSL_CERT) {
      throw new Error('SSL_KEY and SSL_CERT must be defined!');
    }

    const options = {
      key: fs.readFileSync(process.env.SSL_KEY),
      cert: fs.readFileSync(process.env.SSL_CERT)
    };

    if (process.env.SSL_CA) {
      options.ca = fs.readFileSync(process.env.SSL_CA);
    }

    return https.createServer(options, app);
  } else {
    return http.createServer(app);
  }
}

function startServer() {
  const server = createServer();
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
  return server;
}

server = startServer();

// Restart server every few days to ensure SSL certificates are up to date
setInterval(() => {
  server.close(() => {
    server = startServer();
  });

}, RESTART_INTERVAL);


module.exports = app;


//
// Standard Express server stuff
//
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    console.error(bind + ' requires elevated privileges');
    process.exit(1);
    break;
  case 'EADDRINUSE':
    console.error(bind + ' is already in use');
    process.exit(1);
    break;
  default:
    throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
