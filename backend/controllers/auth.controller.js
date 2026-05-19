const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no definido');
}

async function register(req, res) {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const [existing] = await db.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existing.length) {
      return res.status(409).json({ error: 'Email ya registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, email, password, rol, created_at) VALUES (?, ?, ?, ?, NOW())',
      [nombre, email, hashedPassword, rol]
    );

    const user = {
      id: result.insertId,
      nombre,
      email,
      rol
    };

    res.json({ ok: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error registrando usuario' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const [rows] = await db.execute(
      'SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '12h'
    });

    res.json({ ok: true, token, user: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error iniciando sesión' });
  }
}

module.exports = {
  register,
  login
};