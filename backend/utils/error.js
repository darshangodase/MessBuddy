const errorhandler = (statusCode = 500, message = "An error occurred") => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

module.exports = errorhandler;