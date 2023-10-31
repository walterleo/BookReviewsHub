import JWT from "jsonwebtoken";
import CryptoJS from "crypto-js";

function adminAuth(req, res, next)
{
    try {

        let payload = CryptoJS.AES.decrypt(req.headers["x-auth-token"], process.env.ENV_SECRET_KEYS_CRYPTO);
        payload = payload.toString(CryptoJS.enc.Utf8);
        payload = JWT.verify(payload, process.env.ENV_SECRET_KEYS_JWT);
        req.payload = payload;
        return next();
    } catch (error) {
     //   console.log(error);
        return res.status(401).json({error : "Unauthorized access/ Token Expired !"});
    }
}

export default adminAuth;
