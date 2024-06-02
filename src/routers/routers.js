import { Router } from 'express';

// importamos los callbacks
import {
    home, loginRequiredMiddleware, registro, chat, diario, animo, tareas,
    logros, homeFamiliaController, loginRequired, insertarmiembros, submitcontroller,
    loginController, loginRedirect, finalizarInsercion, guardarDiario, calendarioController, addEventController
} from '../controllers/controllers.js';

const router = Router();

router.get('/', home);
router.get('/login', loginRedirect);
router.get('/login/:tableName', loginRequired);
router.get('/registro', registro);
router.get('/calendario/:tableName', loginRequiredMiddleware, calendarioController);
router.get('/chat/:tableName', loginRequiredMiddleware, chat);
router.get('/diario/:tableName', loginRequiredMiddleware, diario);
router.get('/animo/:tableName', loginRequiredMiddleware, animo);
router.get('/tareas/:tableName', loginRequiredMiddleware, tareas);
router.get('/logros/:tableName', loginRequiredMiddleware, logros);
router.get('/homeFamilia/:tableName', loginRequiredMiddleware, homeFamiliaController);
router.get('/agregarmiembros/:tableName', (req, res) => {
    const tableName = req.params.tableName;
    const title = 'Agregar Miembros'; // Definir el título aquí
    res.render('agregarmiembros', { title: title, tableName: tableName });
});
router.get('/finalizarInsercion/:tableName', finalizarInsercion);
router.get('/rutaProtegida', loginRequiredMiddleware, (req, res) => {
    // Lógica de la ruta protegida
});

router.post('/agregarmiembros/:tableName', insertarmiembros);
router.post('/homeFamilia', submitcontroller);
router.post('/login/:tableName', loginController);
router.post('/guardarDiario', loginRequiredMiddleware, guardarDiario);
router.post('/addEvent', loginRequiredMiddleware, addEventController);

export default router;
