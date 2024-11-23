import express from 'express';
import User from '../dao/models/user.model.js';

const router = express.Router();

// Ruta para crear un nuevo usuario
router.post('/create-user', async (req, res) => {
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
      password, // La contraseña será hasheada automáticamente por el middleware del modelo
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

export default router;
