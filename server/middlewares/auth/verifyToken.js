import jwt from "jsonwebtoken";
import cryptoJS from "crypto-js";

const secretKeys_JWT = process.env.ENV_SECRET_KEYS_JWT;
const secretKeys_CRYPTO = process.env.ENV_SECRET_KEYS_CRYPTO;

function authMiddleware(req, res, next) {
  try {
    let token = req.headers["x-auth-token"];
    let bytes = cryptoJS.AES.decrypt(token, secretKeys_CRYPTO); // decrypting token
    let originalToken = bytes.toString(cryptoJS.enc.Utf8); // original token
    const payload = jwt.verify(originalToken, secretKeys_JWT); // decoding token & getting payload
    req.payload = payload;
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Access Denied. Invalid Token/Token Expired" });
  }
}

export default authMiddleware;
