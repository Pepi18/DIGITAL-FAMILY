import {Router} from 'express';

//importamos los callbacks
import {home, login, registro, homeFamilia, calendario, chat, diario, animo, tareas, logros, añadirfamiliares, postcontroller, submitcontroller, loginController, searchPosts, eliminarRegistro} from '../controllers/controllers.js'

const router = Router(); 

router.get ('/', home);
router.get ('/login', login );
router.get ('/registro', registro);
router.get('/homeFamilia', homeFamilia);
router.get('/calendario', calendario);
router.get('/chat', chat);
router.get('/diario', diario);
router.get('/animo', animo);
router.get('/tareas', tareas);
router.get('/logros', logros);
router.get('/añadirfamiliares', añadirfamiliares);

























router.get('/search', searchPosts);



router.post('/post', postcontroller);
router.post('/submit', submitcontroller);
router.post('/login', loginController);

router.delete('/eliminar/:id', eliminarRegistro);


export default router;