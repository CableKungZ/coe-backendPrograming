const { body } = require("express-validator");

const createProduct = [
    body("name").notEmpty().withMessage("Unknown Name"),
    body("price").notEmpty().withMessage("Unknown Price"),
    body("category").notEmpty().withMessage("Unknow Category"),
];

const updateProduct = [
    body("name").notEmpty().withMessage("Unknown Name"),
    body("price").notEmpty().withMessage("Unknown Price"),
    body("category").notEmpty().withMessage("Unknow Category"),
]

module.exports = {
    createProduct,
    updateProduct
}