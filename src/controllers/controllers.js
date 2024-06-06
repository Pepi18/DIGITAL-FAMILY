import {verifyCredentials, connectDB, createFamilyTable, insertDataIntoTable, insertMemberIntoTable, getFamilyNameByTableName, 
insertDiarioEntry, getDiarioEntries, getCalendarEvents, insertCalendarEvent, saveAnimo, getRecentAnimos, getEventsForYear, addEventToCalendar,
saveTarea, getTareas, completarTarea, actualizarTareasNoCompletadas, getLogros} from '../db/db.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { format } from 'date-fns';

//Controladores para las distintas url
    export const home=(req, res) => res.render ('home', {title:"home"});
    export const registro=(req, res) => res.render ('registro', {title:"Registro"});
    export const login = (req, res) => {
        // Verificar si req.session está definido y si tiene un mensaje de error
        const errorMessage = (req.session && req.session.errorMessage) ? req.session.errorMessage : undefined;
        
        // Limpiar el mensaje de error de la sesión una vez que se haya mostrado
        if (req.session && req.session.errorMessage) {
            delete req.session.errorMessage;
        }

        res.render('login',{ title: "login", errorMessage });
    };

    export const animo = (req, res) => {
        const username = req.session.username;
        const tableName = req.params.tableName;
        const title = "Estado de ánimo";
    
        if (!username) {
            return res.redirect(`/login/${tableName}`);
        }
    
        res.render('animo', { title, tableName, username });
    };
    

    export const calendario = (req, res) => {
        const username = req.session.username;
        const tableName = req.params.tableName;
        const title = "Calendario";

        if (!username) {
            return res.redirect(`/login/${tableName}`);
        }

        res.render('calendario', { title, tableName, username });
    };

    export const diario = async (req, res) => {
        const username = req.session.username;
        const tableName = req.params.tableName;
        const title = "Diario";
    
        if (!username) {
            return res.redirect(`/login/${tableName}`);
        }
    
        try {
            const entries = await getDiarioEntries(tableName, username);
            // Formatear las fechas
            const formattedEntries = entries.map(entry => ({
                ...entry,
                fechadiario: format(new Date(entry.fechadiario), 'yyyy-MM-dd')
            }));
            res.render('diario', { title, tableName, username, entries: formattedEntries });
        } catch (error) {
            console.error('Error al obtener las entradas del diario:', error);
            res.status(500).send('Error al obtener las entradas del diario.');
        }
    };
    
    export const tareas = (req, res) => {
        const username = req.session.username;
        const tableName = req.params.tableName;
        const title = "Tareas";

        if (!username) {
            return res.redirect(`/login/${tableName}`);
        }

        res.render('tareas', { title, tableName, username });
    };

    export const logros = (req, res) => {
        const username = req.session.username;
        const tableName = req.params.tableName;
        const title = "Logros";

        if (!username) {
            return res.redirect(`/login/${tableName}`);
        }

        res.render('logros', { title, tableName, username });
    };

    export const chat = (req, res) => {
        const tableName = req.params.tableName;
        const username = req.session.username;
        const title = "Chat";

        if (!username) {
            return res.redirect(`/login/${tableName}`);
        }

        res.render('chat', { title, tableName, username });
    };

    export const  agregarmiembros=(req, res) => res.render ('agregarmiembros', {title:"agregarmiembros"});


    export const homeController = (req, res) => {
        res.render('home', { title: "Home" });
    };

    export const loginRedirect = (req, res) => {
        const { tableName } = req.query;
        if (!tableName) {
            return res.status(400).send('El nombre de la familia es obligatorio');
        }
        res.redirect(`/login/${tableName}`);
    };


    export const submitcontroller = async (req, res) => {
        try {
            const { username, email, password, familyname } = req.body;

            // Verificar qué campos están llegando y sus valores
            console.log('Username:', username);
            console.log('Mail:', email);
            console.log('Password:', password);
            console.log('Familyname:', familyname);

            // Validar que todos los campos estén completos
            if (!username || !email || !password || !familyname || username.trim() === '' || email.trim() === '' || password.trim() === '' || familyname.trim() === '') {
                throw new Error('Por favor, complete todos los campos.');
            }

            const db = await connectDB(); // Conexión a la base de datos

            // Crear un nombre único para la tabla
            const tableName = `${familyname}${Date.now()}`;

            // Crear la tabla
            await createFamilyTable(db, tableName);

            // Insertar datos en la tabla
            await insertDataIntoTable(db, tableName, {
                username,
                email,
                password,
                familyname
            });

            // Redirigir al usuario a su página homeFamilia directamente
            res.redirect(`/homeFamilia/${tableName}`);
        } catch (error) {
            console.error('Error al procesar el formulario:', error);
            res.status(400).send(error.message); // Devolver un error al cliente si algún campo no está cumplimentado
        }
    };

    
    export const homeFamiliaController = async (req, res) => {
    try {
        const tableName = req.params.tableName;
        const username = req.session.username;
        const familyname = await getFamilyNameByTableName(tableName);
        const year = new Date().getFullYear();
        const eventos = await getEventsForYear(tableName, year);
        const title = 'Página de inicio de la familia';
        const agregarMiembrosLink = `/agregarmiembros/${tableName}`;

        // Obtener los estados de ánimo recientes
        const users = await getRecentAnimos(tableName);

        users.forEach(user => {
            user.formattedDate = new Date(user.ultima_fecha).toLocaleString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        });

        res.render('homeFamilia', {
            title,
            familyname,
            tableName,
            agregarMiembrosLink,
            username,
            eventos,
            users // Pasamos los usuarios con sus estados de ánimo a la vista
        });
    } catch (error) {
        console.error('Error al procesar la solicitud de homeFamilia:', error);
        res.status(500).send('Error al procesar la solicitud de homeFamilia');
    }
};
    

    export const insertarmiembros = async (req, res) => {
        try {
            const { username, password } = req.body; // Obtener los datos del formulario

            // Obtener tableName de los parámetros de la URL
            const tableName = req.params.tableName;

            // Imprimir los valores para verificar
            console.log('Username:', username);
            console.log('Password:', password);
            console.log('TableName:', tableName);

            // Validar que los campos no estén vacíos
            if (!username || !password || !tableName) {
                throw new Error('Por favor, complete todos los campos.');
            }

            // Imprimir los valores para verificar
            console.log('Username:', username);
            console.log('Password:', password);
            console.log('TableName:', tableName);

            // Insertar el miembro en la tabla correspondiente
            await insertMemberIntoTable(tableName, username, password);

            // Redirigir de vuelta a la página de agregar miembros
            res.redirect(`/agregarmiembros/${tableName}`);
        } catch (error) {
            console.error('Error al procesar el formulario de agregar miembros:', error);
            res.status(400).send(error.message);
        }
    };


    // Nuevo controlador para finalizar la inserción de miembros y redirigir a homeFamilia
    export const finalizarInsercion = (req, res) => {
        const tableName = req.params.tableName;
        res.redirect(`/homeFamilia/${tableName}`);
    };



    export const loginRequired = (req, res) => {
        // Verificar si req.session está definido y si tiene un mensaje de error
        const errorMessage = (req.session && req.session.errorMessage) ? req.session.errorMessage : undefined;
        
        // Limpiar el mensaje de error de la sesión una vez que se haya mostrado
        if (req.session && req.session.errorMessage) {
            delete req.session.errorMessage;
        }

        const tableName = req.params.tableName; // Obtener tableName de los parámetros de la URL
        const username = req.session.username;

        res.render('login', { title: "login", errorMessage, tableName });
    };



    export const loginRequiredMiddleware = (req, res, next) => {
        if (req.session && req.session.username) {
            return next();
        } else {
            const tableName = req.params.tableName;
            return res.redirect(`/login/${tableName}`);
        }
    };




    export const loginController = async (req, res) => {
        const { username, password} = req.body;
        const tableName = req.params.tableName;

        if (!tableName) {
            return res.status(400).render('login', { errorMessage: 'Table name is required', title: 'Login', tableName: null });
        }

        try {
            const isAuthenticated = await verifyCredentials(tableName, username, password);

            if (isAuthenticated) {
                // Guardar el username y tableName en la sesión
                req.session.username = username;
                req.session.tableName = tableName;

                // Las credenciales son correctas, redirigir a la página de inicio de familia
                return res.redirect(`/homeFamilia/${tableName}`);
            } else {
                // Usuario o contraseña incorrectos
                return res.status(401).render('login', { errorMessage: 'Usuario o contraseña incorrectos', title: 'Login', tableName: null });
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            return res.status(500).send('Error al iniciar sesión');
        }
    };




    export const guardarDiario = async (req, res) => {
        const { contenido } = req.body;
        const username = req.session.username;
        const fechadiario = new Date().toISOString();
        const tableName = req.session.tableName;
    
        try {
            await insertDiarioEntry(tableName, username, fechadiario, contenido);
            // Devolver la entrada recién guardada con la fecha formateada
            res.json({
                username,
                fechadiario: format(new Date(fechadiario), 'yyyy-MM-dd'),
                contenidodiario: contenido
            });
        } catch (error) {
            console.error('Error al guardar la entrada del diario:', error);
            res.status(500).json({ message: 'Error al guardar la entrada del diario.' });
        }
    };
    

    export const calendarioController = async (req, res) => {
        try {
            const tableName = req.params.tableName;
            let year = parseInt(req.query.year) || new Date().getFullYear();
            console.log(`Table: ${tableName}, Year: ${year}`); // Añadir log para depuración
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentDay = currentDate.getDate();
            const currentYear = currentDate.getFullYear(); // Obtener el año actual
        
            const eventos = await getCalendarEvents(tableName, year);
        
            const months = [
                { name: "Enero", days: 31 },
                { name: "Febrero", days: year % 4 === 0 ? 29 : 28 },
                { name: "Marzo", days: 31 },
                { name: "Abril", days: 30 },
                { name: "Mayo", days: 31 },
                { name: "Junio", days: 30 },
                { name: "Julio", days: 31 },
                { name: "Agosto", days: 31 },
                { name: "Septiembre", days: 30 },
                { name: "Octubre", days: 31 },
                { name: "Noviembre", days: 30 },
                { name: "Diciembre", days: 31 }
            ];
    
            // Obtener el nombre de usuario de la sesión si está definido, de lo contrario, establecerlo como undefined
            const username = req.session.username || undefined;
    
            res.render('calendario', {
                title: 'Calendario Familiar',
                tableName: tableName,
                year: year,
                currentMonth: currentMonth,
                currentDay: currentDay,
                currentYear: currentYear, // Pasar el año actual a la plantilla
                months: months,
                eventos: eventos,
                username: username // Pasar el nombre de usuario a la vista
            });
        } catch (error) {
            console.error('Error al cargar el calendario:', error);
            res.status(500).send('Error al cargar el calendario');
        }
    };
    
    
            
    export const addEventController = async (req, res) => {
        try {
            const { tableName, title, description, date } = req.body;
            await addEventToCalendar(tableName, date, title, description);
            res.status(200).send('Event added successfully!');
        } catch (error) {
            console.error('Error al agregar el evento:', error);
            res.status(500).send('Error al agregar el evento');
        }
    };

    export const saveAnimoController = async (req, res) => {
        try {
            const { contenidoanimo } = req.body;
            const username = req.session.username;
            const tableName = req.params.tableName; // Obtener el nombre de la tabla de la URL
            const fechamensaje = new Date().toISOString(); // Guardamos la fecha en formato ISO
    
            console.log("Datos recibidos:", contenidoanimo, username, tableName, fechamensaje); // Verificar los datos recibidos
    
            await saveAnimo(tableName, username, contenidoanimo, fechamensaje); // Pasar tableName como parámetro
    
            res.redirect(`/guardar-animo/${tableName}`);
        } catch (error) {
            console.error('Error al guardar el estado de ánimo:', error);
            res.status(500).send('Error al guardar el estado de ánimo');
        }
    };



    export const tareasController = async (req, res) => {
        try {
            const tableName = req.params.tableName;
            const username = req.session.username;
    
            // Actualizar tareas no completadas
            await actualizarTareasNoCompletadas(tableName);
    
            // Obtener las tareas
            const tareas = await getTareas(tableName);
    
            res.render('tareas', {
                title: 'Está en tareas',
                username,
                tableName,
                tareas
            });
        } catch (error) {
            console.error('Error al procesar la solicitud de tareas:', error);
            res.status(500).send('Error al procesar la solicitud de tareas');
        }
    };
    
    // Controlador para guardar una nueva tarea
    export const saveTareaController = async (req, res) => {
        try {
            const { tarea, username, fechafintarea } = req.body;
            const tableName = req.params.tableName;
    
            await saveTarea(tableName, username, tarea, fechafintarea);
    
            res.redirect(`/tareas/${tableName}`);
        } catch (error) {
            console.error('Error al guardar la tarea:', error);
            res.status(500).send('Error al guardar la tarea');
        }
    };
    
    // Controlador para marcar una tarea como completada
    export const completarTareaController = async (req, res) => {
        try {
            const tareaId = req.params.tareaId;
            const tableName = req.params.tableName;
    
            await completarTarea(tableName, tareaId);
    
            res.redirect(`/tareas/${tableName}`);
        } catch (error) {
            console.error('Error al completar la tarea:', error);
            res.status(500).send('Error al completar la tarea');
        }
    };
    
    // Controlador para la vista de logros
    export const logrosController = async (req, res) => {
        try {
            const tableName = req.params.tableName;
            const username = req.session.username;
            const logros = await getLogros(tableName);
    
            if (!username) {
                return res.status(401).send('No autorizado');
            }
    
            res.render('logros', {
                title: 'Logros',
                username,  // Pasa el username aquí
                tableName, // Pasa el tableName aquí
                logros
            });
        } catch (error) {
            console.error('Error al procesar la solicitud de logros:', error);
            res.status(500).send('Error al procesar la solicitud de logros');
        }
    };

    

    






















































