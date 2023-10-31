import { body, validationResult } from 'express-validator';

function userRegisterValidatorRules() {
    return [
        body("firstname", "First Name is Required").notEmpty().isLength({ min: 2 }),
        body("lastname", "Last Name is Required / Min 2 Characters").notEmpty().isLength({ min: 2 }),
        body("email", "Email is Required").isEmail(),
        body("password", "Password should be Min 8 Characters, Atleast 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Character")
            .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
        body("password2").custom(
            (value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Password & Confirm Password do not match");
                } else {
                    return true;
                }
            }
        )
    ]
}

function userLoginValidatorRules() {
    return [
        body("password", "Password is Required").notEmpty(),
        body("email", "Email is Required").isEmail()
    ]
}

function addBookValidations() {
    return [
        body("title", "Title is Required").isString().isLength({ min: 2 }),
        body("author", "Author is Required / Min 2 Characters").isString().isLength({ min: 2 }),
        body("coverImageUrl", "Cover Image URL is Required").isURL(),
        body("publisher", "Publisher name is Required").isString().isLength({ min: 2 }),
        body("synopsis", "Synopsis is Required").isString().isLength({ min: 2 }),
        body("pageCount", "Page Count is required and must be a Number").isNumeric(),
        body("id", "id is required").notEmpty()
    ]
}

function errorMiddleware(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    return next();
}

export {
    userRegisterValidatorRules,
    userLoginValidatorRules,
    addBookValidations,
    errorMiddleware
}