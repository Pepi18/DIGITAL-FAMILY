// Importaciones necesarias
import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io'; // Importar como "Server" para evitar conflicto con el servidor HTTP
import ejs from 'ejs';
import bodyParser from 'body-parser';
import session from 'express-session';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db/db.js';
import indexRoutes from './routers/routers.js';
import { PORT } from './config.js';
import socketHandler from './controllers/socket.js'; // Importar el controlador de sockets

const __dirname = dirname(fileURLToPath(import.meta.url));

// Inicio express y lo almaceno en app
const app = express();
const server = http.createServer(app);
const io = new socketIo(server); // Crear instancia de socket.io vinculada al servidor HTTP

// Configuración de express-session
app.use(session({
    secret: 'your-secret-key', // Cambia esto por una clave secreta segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Si usas HTTPS, cambia a true
}));

// Configuro body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar motor de plantillas
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Servir archivos estáticos
app.use('/css', express.static(join(__dirname, 'css')));
app.use('/imagenes', express.static(join(__dirname, 'imagenes')));

// Usar enrutador
app.use(indexRoutes);

// Configuración del chat usando socket.io
socketHandler(io); // Usar el controlador de sockets

// Conexión a la base de datos y inicio del servidor
async function startServer() {
    try {
        // Conectar a la base de datos
        await connectDB();

        // Iniciar el servidor
        server.listen(PORT, () => {
            console.log('El servidor está escuchando por el puerto', PORT);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Llamar a la función para iniciar el servidor
startServer();
