import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Ruta para crear un nuevo usuario
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    // Crear el nuevo usuario
    const user = new User({
      first_name,
      last_name,
      email,
      age,
      password, // La contraseña será hasheada automáticamente en el middleware del modelo
    });

    // Guardar el usuario en la base de datos
    await user.save();

    // Responder con el usuario creado
    res.status(201).json({
      message: 'Usuario creado correctamente',
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role, // role será por defecto 'user'
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error });
  }
});

export default router;
