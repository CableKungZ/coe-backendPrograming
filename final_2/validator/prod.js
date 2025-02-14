const { body } = require("express-validator");

const createProduct = [
    body("name").notEmpty().withMessage("Unknown Name"),
    body("amount").notEmpty().withMessage("Unknow amount"),
];

const updateProduct = [
    body("name").notEmpty().withMessage("Unknown Name"),
    body("amount").notEmpty().withMessage("Unknown amount"),
]

module.exports = {
    createProduct,
    updateProduct
}