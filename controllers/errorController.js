const ErrorProvider = require("../classes/ErrorProvider");

// ! 403: Forbidden
const validationError = (err) => {
  const messages = err.message.split(",");

  const message = messages
    .map((message, index) => message.split(":").at(index === 0 ? 2 : 1))
    .join("")
    .trim();

  return new ErrorProvider(403, "fail", message);
};

module.exports = (err, req, res, next) => {
  console.error(err);

  if (process.env.NODE_ENV === "production") {
    if (err.name === "ValidationError") err = validationError(err);
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

  next();
};
