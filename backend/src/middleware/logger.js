const debug = require('debug')('admin:requests');

const adminLogger = (req, res, next) => {
  debug('Admin API Request:', {
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      authorization: req.headers.authorization ? 'present' : 'missing',
      contentType: req.headers['content-type']
    }
  });

  const originalSend = res.send;
  res.send = function(data) {
    debug('Admin API Response:', {
      statusCode: res.statusCode,
      data: process.env.NODE_ENV === 'development' ? data : 'hidden in production'
    });
    originalSend.apply(res, arguments);
  };

  next();
};

module.exports = adminLogger;
