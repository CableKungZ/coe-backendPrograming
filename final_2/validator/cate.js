const { body } = require("express-validator");

const createCategory = [
    body("categoryName").notEmpty().withMessage("Unknow Category Name"),
];

const updateCategory = [
    body("categoryName").notEmpty().withMessage("Unknow Category Name"),

]

module.exports = {
    createCategory,
    updateCategory
}