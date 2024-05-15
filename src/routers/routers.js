import {Router} from 'express';

//importamos los callbacks
import {home, login, registro, calendario, chat, diario, animo, tareas, logros,homeFamiliaController,insertarmiembros, postcontroller, submitcontroller,loginController, searchPosts, eliminarRegistro} from '../controllers/controllers.js'

const router = Router(); 

router.get ('/', home);
router.get ('/login', login );
router.get ('/registro', registro);
router.get('/calendario', calendario);
router.get('/chat', chat);
router.get('/diario', diario);
router.get('/animo', animo);
router.get('/tareas', tareas);
router.get('/logros', logros);
router.get('/homeFamilia/:tableName', homeFamiliaController);
router.get('/agregarmiembros/:tableName', (req, res) => {
    const tableName = req.params.tableName;
    const title = 'Agregar Miembros'; // Definir el título aquí
    res.render('agregarmiembros', { title: title, tableName: tableName });
});


router.post('/agregarmiembros/:tableName', insertarmiembros);
router.post('/homeFamilia', submitcontroller);






















router.get('/search', searchPosts);



router.post('/post', postcontroller);

router.post('/login', loginController);

router.delete('/eliminar/:id', eliminarRegistro);


export default router;