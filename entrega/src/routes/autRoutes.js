import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../dao/models/user.model.js';
import verifyToken from '../middlewares/verifyToken.js';  // Importamos el middleware para proteger rutas

const router = express.Router();
const secretKey = 'tu_clave_secreta';  // Usa una clave secreta segura y más compleja en producción

// Ruta de login con Passport y JWT
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const user = req.user;  // El usuario autenticado por Passport

  // Crear el payload para el JWT
  const payload = { id: user._id, email: user.email };

  // Crear el token JWT
  const token = jwt.sign(payload, secretKey, { expiresIn: '1h' }); // El token expira en 1 hora

  // Enviar el token al cliente
  res.json({
    message: 'Autenticación exitosa',
    token,  // Puedes devolver el token también en la respuesta, si lo deseas
  });
});

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    // Crear el nuevo usuario
    const user = new User({
      first_name,
      last_name,
      email,
      age,
      password,  // La contraseña será hasheada automáticamente por el middleware en el modelo
    });

    // Guardar el usuario en la base de datos
    await user.save();

    // Responder con el usuario creado (excluyendo la contraseña)
    res.status(201).json({
      message: 'Usuario creado correctamente',
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role, // Por defecto, el rol será 'user'
      },
    });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
});

// Ruta protegida para obtener el perfil del usuario (requiere token JWT)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // Accedemos al usuario mediante el token decodificado en el middleware
    const user = await User.findById(req.user.id); // 'req.user' proviene del middleware 'verifyToken'
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Responder con los datos del usuario
    res.json({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      age: user.age,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
  }
});

// Ruta /current para obtener los datos del usuario actual usando el JWT
router.get('/current', verifyToken, async (req, res) => {
  try {
    // Accedemos al usuario mediante el token decodificado en el middleware
    const user = await User.findById(req.user.id); // 'req.user' proviene del middleware 'verifyToken'
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Responder con los datos del usuario
    res.json({
      message: 'Usuario autenticado correctamente',
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los datos del usuario', error: error.message });
  }
});

export default router;




