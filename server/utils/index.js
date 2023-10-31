import dotenv from 'dotenv';
import sendMail from "./sendMail.js";


dotenv.config();

console.log(process.env.NODE_ENV); 

function randomString(length) {
    let chars = "ABCDEF23456GHIJKLMNfghijklmnopqrstuvwxOPQRSTUVWXYZabcdeyz01789";
    let token = ""
    for (let i = 0; i < length; i++) {
        token += chars[Math.floor(Math.random() * (chars.length - 1))];
    }
    return token;
}

export { randomString, sendMail };