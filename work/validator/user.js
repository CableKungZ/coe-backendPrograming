const { body } = require("express-validator");

const createUser = [
    body("username").notEmpty().isLength({min:5}).withMessage("Unknow Username"),
    body("password").notEmpty().isLength({min:5}).withMessage("Unknow Password"),
    body("role").notEmpty().withMessage("Unknow Role"),
];

module.exports = {
    createUser
}