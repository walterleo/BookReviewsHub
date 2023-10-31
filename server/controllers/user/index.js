import express from "express";
import bcrypt from "bcrypt";
import config from "config";
import jwt from "jsonwebtoken";

// DB Models
import User from "../../models/User/index.js";
import Admin from "../../models/Admin/index.js"
import {
    randomString,
    // sendMail
} from "../../utils/index.js";
import {
    userRegisterValidatorRules,
    userLoginValidatorRules,
    errorMiddleware,
} from "../../middlewares/validations/index.js";

import generateToken from "../../middlewares/auth/generateToken.js";
import authMiddleware from "../../middlewares/auth/verifyToken.js";

const router = express.Router();


/*
    API End Point : /api/user/register
    Method : POST
    Access Type : Public
    Validations:
        Password must be 8 characters minimum length, 1 uppercase, 1 special character,1 lowercase is mandatory
        Email address is unique and required field
        Firstname length not more than 25 characters
        password & password2 should match, but save password field only.
    Description: User Signup

*/

router.post(
    "/register",
    userRegisterValidatorRules(),
    errorMiddleware,
    async (req, res) => {
        try {
            //Destructuring Req.Body
            let { firstname, lastname, email, password } = req.body;

            //Avoid Double Registration
            let userData = await Admin.findOne({ email });
            if (userData) {
                return res.status(409).json({ error: "User Email Already Registered" });
            }
            userData = await User.findOne({ email });
            if (userData) {
                return res.status(409).json({ error: "User Email Already Registered" });
            }

            //Password Hashing
            req.body.password = await bcrypt.hash(password, 12);

            //Create Instance for The Model
            const user = new User(req.body);

            user.userverifytoken = randomString(8);
            const tokenEmail = jwt.sign({ emailToken: user.userverifytoken },
                "emailToken@cs", { expiresIn: "1h" }
            );

            await user.save();
            res.status(200).json({ success: "User is Registered Successfully" });

            //Trigger Email Verification
            /*
            sendMail({
                subject: "User Account Verification - Learning Management System",
                to: email,
                body: `Hi ${firstname} ${lastname} <br/>
            Thank you for Signing Up. Please <a href='${config.get(
                    "URL"
                )}/api/user/email/verify/${tokenEmail}'>Click Here </a>
            to verify your Email Address. <br/><br/>
            Thank you <br/>
            <b>Team Learning Management System.</b>`,
            });
            */

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);


/*
    API End Point : /api/user/email/verify/:emailToken
    Method : GET
    Access Type : Public
    Validations:
       Check for Valid Token
    Description: Email Verification API

*/

router.get("/email/verify/:token", async (req, res) => {
    try {
        let { token } = req.params;
        const emailPayload = jwt.verify(token, "emailToken@cs");
        if (!emailPayload)
            return res
                .status(401)
                .json({
                    error: "Token expired. Request to resend a new Email verification Link",
                });
        const userData = await User.findOne({
            "userverifytoken": emailPayload.emailToken,
        });
        if (userData.userverified)
            return res
                .status(200)
                .json({ success: "The Email has been Verified Already." });
        userData.userverified = true;
        await userData.save();
        res
            .status(200)
            .json({ success: "The Email has been Verified Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


/*
    API End Point : /api/user/resend/email
    Method : POST
    Access Type : Public
    Validations:
       Email is not Empty
       Password is not Empty
    Description: Resend Verification Email

*/

router.post(
    "/resend/email",
    userLoginValidatorRules(),
    errorMiddleware,
    async (req, res) => {
        try {
            //Destructuring Req.Body
            let { email, password } = req.body;

            //Avoid Double Registration
            const userData = await User.findOne({ email });
            if (!userData) {
                return res
                    .status(401)
                    .json({ error: "Invalid Credentials. Unauthorised Access." });
            }
            const passValid = await bcrypt.compare(password, userData.password);
            if (!passValid) {
                return res
                    .status(401)
                    .json({ error: "Invalid Credentials. Unauthorised Access." });
            }

            // check if verified already
            if (userData.userverified.email)
                return res
                    .status(201)
                    .json({ success: "Your Email Address is already verified." });

            res
                .status(200)
                .json({
                    success: "Email verification link has been successfully sent to your Email Address",
                });
            const tokenEmail = jwt.sign({ emailToken: userData.userverifytoken.email },
                "emailToken@cs", { expiresIn: "1h" }
            );

            //Trigger Email Verification
            /*
            sendMail({
                subject: "User Account Verification - Learning Management System",
                to: email,
                body: `Hi ${userData.firstname} ${userData.lastname} <br/>
            Please <a href='${config.get(
                    "URL"
                )}/api/user/email/verify/${tokenEmail}'>Click Here </a>
            to verify your Email Address. <br/><br/>
            Thank you <br/>
            <b>Team Learning Management System.</b>`,
            });
            */
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);



export default router;