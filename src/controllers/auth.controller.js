import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/mysql.config.js";
import ENVIRONMENT from "../config/environment.js";
import { sendVerificationEmail } from "../utils/mail.util.js";

// REGISTRO DE USUARIO
export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaciones 
    if (!name || !email || !password) {
      return res.json({ 
        message: "Todos los campos son obligatorios",
        status: 400,
        ok: false
      });
    }
    if (password.length < 6) {
      return res.json({ 
        message: "La contraseña debe tener al menos 6 caracteres",
        status: 400,
        ok: false
      });
    }
    // Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Formato de email inválido",
        ok: false
      });
    }

    // Verificar si el usuario ya existe
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]); 
    if (existingUser.length > 0) {
      return res.json({ 
        message: "El usuario ya existe",
        status: 400,
        ok: false 
      });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generar token de verificación
    const verificationToken = jwt.sign({ email }, ENVIRONMENT.SECRET_KEY_JWT, { expiresIn: "1d" });

    // Insertar el nuevo usuario con el token de verificación
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, verified, verification_token) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, 0, verificationToken]
    );

    // Enviar mail de verificacion. Esta adentro de un try catch por si falla. Para que el usuario aun quede registrado
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Error enviando email de verificación:", emailError);
    }

    res.json({ 
      message: "Usuario registrado. Verifica tu email.",
      status: 201,
      ok: true
    });
  
  } catch (error) {
    console.error("Error en el registro:", error);
    res.json({ 
      message: "Error en el servidor",
      status: 500,
      ok: false 
    });
  }
};

//LOGIN DE USUARIO 
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones 
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Todos los campos son obligatorios",
        ok: false 
      });
    }

    // Verificar si el usuario existe
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ 
        message: "Usuario o contraseña incorrectos",
        ok: false 
      });
    }

    const userData = users[0];

    // Verificar si la cuenta está activada
    if (!userData.verified) {
      return res.status(400).json({ 
        message: "Cuenta no verificada. Revisa tu correo.",
        ok: false 
      });
    }

    // Comparar la contraseña
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        message: "Usuario o contraseña incorrectos",
        ok: false 
      });
    }

    // Generar JWT Token
    const token = jwt.sign({ id: userData.id, email: userData.email }, ENVIRONMENT.SECRET_KEY_JWT, {
      expiresIn: "2h",
    });

    return res.status(200).json({ 
      message: "Login exitoso",
      token,
      ok: true 
    });

  } catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).json({ 
      message: "Error en el servidor",
      ok: false
    });
  }
};

export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ 
        message: "Falta token de verificacion", 
        ok: false 
      });
    }

    // Verificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, ENVIRONMENT.SECRET_KEY_JWT);
    } catch (error) {
      return res.status(400).json({ 
        message: "El token no se pudo verificar", 
        ok: false 
      });
    }

    // Verificar si el usuario ya está activado
    const [user] = await pool.query("SELECT verified FROM users WHERE email = ?", [decoded.email]);

    if (user.length === 0) {
      return res.status(400).json({ 
        message: "Usuario no encontrado", 
        ok: false 
      });
    }

    if (user[0].verified) {
      return res.status(200).json({ 
        message: "Cuenta ya verificada", 
        ok: true 
      });
    }

    // Activar la cuenta del usuario en la base de datos
    const [result] = await pool.query("UPDATE users SET verified = 1 WHERE email = ?", [decoded.email]);

    if (result.affectedRows === 0) {
      return res.status(500).json({ 
        message: "No se pudo verificar la cuenta", 
        ok: false 
      });
    }

    res.json({ 
      message: "Cuenta verificada con éxito", 
      ok: true 
    });

  } catch (error) {
    console.error("Error en la verificación:", error);
    res.status(500).json({ 
      message: "Error en el servidor", 
      ok: false 
    });
  }
};

export const resendVerificationController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: "Correo requerido", 
        ok: false 
      });
    }

    // Verificar si el usuario existe
    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (user.length === 0) {
      return res.status(400).json({ 
        message: "Usuario no encontrado", 
        ok: false 
      });
    }

    const userData = user[0];

    // Si ya está verificado, no es necesario reenviar el email
    if (userData.verified) {
      return res.status(400).json({ message: "El usuario ya está verificado", ok: false });
    }

    // Generar un nuevo token de verificación
    const verificationToken = jwt.sign({ email }, ENVIRONMENT.SECRET_KEY_JWT, { expiresIn: "1d" });

    // Actualizar el token en la base de datos
    await pool.query("UPDATE users SET verification_token = ? WHERE email = ?", [verificationToken, email]);

    // Enviar el email de verificación
    await sendVerificationEmail(email, verificationToken);

    res.json({ message: "Correo de verificación reenviado", ok: true });
  } catch (error) {
    console.error("Error en el reenvío de verificación:", error);
    res.status(500).json({ 
      message: "Error en el servidor", 
      ok: false 
    });
  }
};
