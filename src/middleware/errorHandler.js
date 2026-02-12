module.exports = (err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  const errorLabel = status === 500 ? 'Internal Server Error' : err.message;
  res.status(status).json({ error: errorLabel, message: err.message });
};
