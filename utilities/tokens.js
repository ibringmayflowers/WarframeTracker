const jwt = require('jsonwebtoken');
const tokenExpirationTime = '12h';
const tokenKey = "qegjqklegjqwlkgjqwlkegj" //TODO hide


//generate a token
function generateToken(user) {
    return jwt.sign({ username: user.username }, tokenKey, { expiresIn: tokenExpirationTime });
}
// verify a token and session/cookie
function verifyToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    jwt.verify(token, tokenKey, (err, decoded) => {
        if (err) {
            return res.redirect('/login');
        }
        req.user = decoded;
        next();
    })
}

module.exports = { generateToken, verifyToken };
