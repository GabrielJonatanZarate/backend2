import jwt from 'jsonwebtoken';

const secretKey = 'tu_clave_secreta';  // Cambia esto por una clave secreta más segura

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
    // Obtenemos el token del encabezado Authorization
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No se proporcionó un token' });
    }

    // Verificamos el token con la clave secreta
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }

        // Si el token es válido, guardamos los datos del usuario en `req.user`
        req.user = decoded;  // El payload del JWT contiene la información del usuario
        next();  // Continuamos con la siguiente función (ruta)
    });
};

export default verifyToken;
