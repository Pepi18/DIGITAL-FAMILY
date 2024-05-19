console.log('Hola NodeJS');

import express from 'express'; 
import ejs from 'ejs';
import bodyParser from 'body-parser';
import session from 'express-session'; // Importar express-session

// Importamos para realizar conexión a la base de datos
import { connectDB } from './db/db.js';

// Cuidado con el SO de despliegue windows
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Importamos nuestro enrutador
import indexRoutes from './routers/routers.js';

// Importamos la variable de PORT para el servidor
import { PORT } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

// Inicio express y lo almaceno en app
const app = express();

// Configuración de express-session
app.use(session({
    secret: 'your-secret-key', // Cambia esto por una clave secreta segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Si usas HTTPS, cambia a true
}));

// Conexión a la base de datos
async function startServer() {
    try {
        // Conectar a la base de datos
        await connectDB();

        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log('El servidor está escuchando por el puerto', PORT);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Llamar a la función para iniciar el servidor
startServer();

console.log('El servidor está escuchando por el puerto', PORT);

// Configuro body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar motor de plantillas
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
console.log(__dirname, 'views');

// Servir archivos estáticos
app.use('/css', express.static(join(__dirname, 'css')));
app.use('/imagenes', express.static(join(__dirname, 'imagenes')));

// Usar enrutador
app.use(indexRoutes);
