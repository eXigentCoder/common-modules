'use strict';

module.exports = function notFound() {
    return function _notFound(req, res) {
        res.status(404).json({ message: `Route not found : ` + req.originalUrl });
    };
};
