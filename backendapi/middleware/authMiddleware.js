module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid API Credentials.', status: 'error' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== 'your-token') {
        return res.status(403).json({ message: 'You are not authorized to access this location.', status: 'error' });
    }
    next();
};
