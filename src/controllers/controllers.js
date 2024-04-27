import {createpost, createsubmit, verifyCredentials, searchPostsInDatabase, deleteRecord} from '../db/db.js';

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
export const  homeFamilia=(req, res) => res.render ('homeFamilia', {title:"Familia"});
export const  anadirfamiliares=(req, res) => res.render ('anadirfamiliares', {title:"Añadir familiares"});
export const  animo=(req, res) => res.render ('animo', {title:"Estado de ánimo"});
export const  calendario=(req, res) => res.render ('calendario', {title:"Calendario"});
export const  diario=(req, res) => res.render ('diario', {title:"Diario"});
export const  tareas=(req, res) => res.render ('tareas', {title:"Tareas"});
export const  logros=(req, res) => res.render ('logros', {title:"Logros"});
export const  chat=(req, res) => res.render ('chat', {title:"Chat"});
export const  agregarmiembros=(req, res) => res.render ('agregarmiembros', {title:"agregarmiembros"});



//controlador para el registro
export const submitcontroller = async (req, res) => {
    console.log(req.body); 
    const { nombrefamilia, password } = req.body;

    try {
        // Intentar registrar al usuario
        await createsubmit(nombrefamilia, password);
        // Si se realiza el registro con éxito, redirigir a la página principal u otra página
        res.render('registro.ejs', { title:'registro.ejs', successMessage: 'Registro exitoso' });
    } catch (error) {
        // Si hay un error al registrar al usuario, mostrar un mensaje de error en la página de registro
        console.error('Error en el registro:', error);
        res.render('registro.ejs', { title: 'registro.ejs', errorMessage: 'Error en el registro. Nombre de usuario ya existe. Por favor, inténtalo de nuevo con otro nombre de usuario.' });
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


// Controlador para el inicio de sesión
export const loginController = async (req, res) => {
    const { username, password } = req.body;

    // Verificar las credenciales consultando la base de datos
    try {
        const isAuthenticated = await verifyCredentials(username, password);

        if (isAuthenticated) {
            // Las credenciales son correctas, redirigo a la zona personal
            return res.redirect('/crud');
        } else {
            // Usuario o contraseña incorrectos
            return res.status(401).render('login', { errorMessage: 'Usuario o contraseña incorrectos', title: 'Login' });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).send('Error al iniciar sesión');
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



