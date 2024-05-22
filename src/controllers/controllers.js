import {createpost,verifyCredentials, searchPostsInDatabase, deleteRecord, connectDB, createFamilyTable, insertDataIntoTable,insertMemberIntoTable, getFamilyNameByTableName} from '../db/db.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

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

    export const diario = (req, res) => {
        const username = req.session.username;
        const tableName = req.params.tableName;
        const title = "Diario";

        if (!username) {
            return res.redirect(`/login/${tableName}`);
        }

        res.render('diario', { title, tableName, username });
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
            const username = req.session.username; // Obtener el tableName de los parámetros de la URL
            const familyname = await getFamilyNameByTableName(tableName); // Obtener el familyname asociado al tableName

            // Definir el título para la página
            const title = 'Página de inicio de la familia';

            // Generar el enlace a la página agregarmiembros
            const agregarMiembrosLink = `/agregarmiembros/${tableName}`;

            // Renderizar la página homeFamilia y pasar el enlace a la plantilla
            res.render('homeFamilia', { title: title, familyname: familyname, tableName: tableName, agregarMiembrosLink: agregarMiembrosLink, username: username });
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




















































//Controlador para el post
export const postcontroller = async (req, res) => {
    console.log(req.body); 
    const { titulo, texto } = req.body;

    try {
        await createpost(titulo, texto);
        res.redirect('/post');
    } catch (error) {
        console.error('Error al guardar el post:', error);
        res.status(500).send('Error al guardar el post');
    }
};



//Controlador para la búsqueda en la tabla posts
export const searchPosts = async (req, res) => {
    try {
        const { titulo } = req.query;
        // Realizar la consulta para buscar las publicaciones por título
        const datos = await searchPostsInDatabase(titulo);
        console.log('Posts obtenidos del controlador:', datos); // Añadir este console.log para verificar posts

        // Renderizar la vista de 'search' con los resultados de la búsqueda
        res.render('search', { titulo: 'Resultados de la búsqueda', datos: datos });
    } catch (error) {
        console.error('Error al buscar publicaciones por título:', error);
        res.status(500).send('Error al buscar publicaciones por título');
    }
};
export const eliminarRegistro = async (req, res) => {
    const { id } = req.params;

    try {
        await deleteRecord(id);
        res.sendStatus(200); // Enviar respuesta de éxito
    } catch (error) {
        console.error('Error al eliminar el registro:', error);
        res.sendStatus(500); // Enviar respuesta de error del servidor
    }
};



