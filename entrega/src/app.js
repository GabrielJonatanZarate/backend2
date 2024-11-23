import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import authRoutes from './routes/authRoutes.js'; // Importa las rutas de autenticación
import './config/passport.js'; // Asegúrate de que la configuración de Passport se cargue antes de las rutas
import cookieParser from 'cookie-parser';
// Crear una aplicación Express
const app = express();

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(express.json());

// Conexión a MongoDB
const mongoURI = 'mongodb://localhost:27017/mi_base_de_datos';  // Cambia este URI por tu configuración
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Conexión a MongoDB exitosa');
  })
  .catch((error) => {
    console.error('Error al conectar con MongoDB:', error.message);
  });

// Inicializar Passport
app.use(passport.initialize());  // Asegúrate de inicializar Passport

// Rutas de autenticación
app.use('/auth', authRoutes); // Usa las rutas de autenticación en el prefijo /auth

// Ruta para crear un nuevo usuario
app.post('/create-user', async (req, res) => {
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

// Puerto en el que corre la aplicación
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


app.use(cookieParser());