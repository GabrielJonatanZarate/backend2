import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import jwt from 'jsonwebtoken';
import User from '../dao/models/user.model.js';

// Clave secreta para firmar el token JWT
const secretKey = 'tu_clave_secreta';  // Asegúrate de usar algo más seguro en producción

// Configuración de Passport para la estrategia local (login)
passport.use(new LocalStrategy(
  {
    usernameField: 'email', // Usamos el correo electrónico como "nombre de usuario"
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      // Buscar el usuario por su correo electrónico
      const user = await User.findOne({ email });

      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }

      // Comparar la contraseña ingresada con la almacenada
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }

      // Si todo está correcto, devolver el usuario
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Estrategia "current" para obtener el usuario a partir de un token JWT en las cookies
passport.use('current', async (req, done) => {
  const token = req.cookies.token; // Extraemos el token de la cookie

  if (!token) {
    return done(null, false, { message: 'No se encontró el token en las cookies' });
  }

  try {
    // Verificar el token JWT
    const decoded = jwt.verify(token, secretKey);  // Decodificamos el token usando la clave secreta

    // Buscar el usuario asociado al token
    const user = await User.findById(decoded.id);

    if (!user) {
      return done(null, false, { message: 'Usuario no encontrado' });
    }

    // Si el token es válido y el usuario existe, devolver el usuario
    return done(null, user);
  } catch (error) {
    return done(error, false, { message: 'Token no válido' });
  }
});

// Serialize y Deserialize para manejar la sesión de usuario
passport.serializeUser((user, done) => {
  done(null, user.id);  // Guardamos el ID del usuario en la sesión
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);  // Deserializamos al usuario
  } catch (error) {
    done(error, null);
  }
});
