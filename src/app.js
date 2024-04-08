console.log('Hola NodeJS');

import express from 'express'; 
import ejs from 'ejs';
import bodyParser from 'body-parser';

//Importamos para realizar conexión a la base de datos
import { connectDB } from './db/db.js';

//Cuidado con el SO de despliegue windows
import {dirname, join} from 'path'
import {fileURLToPath} from 'url';

//importamos  nuestro enrutador
import indexRoutes from './routers/routers.js';

//Importamos la variable de PORT para el servidor
import {PORT} from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

//inicio express y lo almaceno en app
const app = express();

//Conexión a la base de datos
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

//configuro body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//configurar motor de plantillas
app.set('view engine', 'ejs');
app.set('views',join(__dirname, 'views'));
console.log(__dirname, 'views');

//servir archivos estáticos
app.use('/css', express.static(join(__dirname,'css')));

//usar enrutador
app.use(indexRoutes);






