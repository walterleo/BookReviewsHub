import jwt from "jsonwebtoken";
import cryptoJS from "crypto-js";

const secretKeys_JWT = process.env.ENV_SECRET_KEYS_JWT;
const secretKeys_CRYPTO = process.env.ENV_SECRET_KEYS_CRYPTO;

function generateToken(payload) {
  try {
    const token = jwt.sign(payload, secretKeys_JWT, { expiresIn: "1h" });
    let cipherToken = cryptoJS.AES.encrypt(token, secretKeys_CRYPTO).toString();
    return cipherToken;
  } catch (err) {
    return;
  }
}

export default generateToken;
