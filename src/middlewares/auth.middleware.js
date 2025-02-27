import jwt from "jsonwebtoken";
import ENVIRONMENT from "../config/environment.js";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "Acceso denegado",
      ok: false
    });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], ENVIRONMENT.SECRET_KEY_JWT);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
      ok: false
    });
  }
};

export default verifyToken;


