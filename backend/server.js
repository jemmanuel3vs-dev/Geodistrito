const app = require('./app');
require('dotenv').config();

const errorMiddleware = require('./middleware/error.middleware');

/*
   MIDDLEWARE DE ERRORES
*/
app.use(errorMiddleware);

/*
   INICIAR SERVIDOR
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

