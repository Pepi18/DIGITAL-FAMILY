import { Router } from 'express';

// importamos los callbacks
import {
    home, loginRequiredMiddleware, registro, chat, diario, animo, tareas,
    logros, homeFamiliaController, loginRequired, insertarmiembros, submitcontroller,
    loginController, loginRedirect, finalizarInsercion, guardarDiario, calendarioController, addEventController,
    tareasController, logrosController, saveTareaController, completarTareaController
} from '../controllers/controllers.js';
import { saveAnimo, getRecentAnimos } from '../db/db.js';

const router = Router();

router.get('/', home);
router.get('/login', loginRedirect);
router.get('/login/:tableName', loginRequired);
router.get('/registro', registro);
router.get('/calendario/:tableName', loginRequiredMiddleware, calendarioController);
router.get('/chat/:tableName', loginRequiredMiddleware, chat);
router.get('/diario/:tableName', loginRequiredMiddleware, diario);
router.get('/animo/:tableName', loginRequiredMiddleware, animo);
router.get('/tareas/:tableName', loginRequiredMiddleware, tareasController);
router.get('/logros/:tableName', loginRequiredMiddleware, logrosController);
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
router.post('/guardar-animo/:tableName', loginRequiredMiddleware, async (req, res) => {
    try {
        const tableName = req.params.tableName;
        const username = req.session.username;
        const { contenidoanimo } = req.body;
        const fechaanimo = new Date().toISOString();

        await saveAnimo(tableName, username, contenidoanimo, fechaanimo);

        // Obtener el último estado de ánimo del usuario
        const recentAnimos = await getRecentAnimos(tableName);
        const estadoAnimo = recentAnimos.find(user => user.username === username);

        res.render('animo', {
            title: 'Estado de Ánimo',
            username,
            tableName,
            estadoAnimo // Asegúrate de pasar estadoAnimo a la vista
        });
    } catch (error) {
        console.error('Error al guardar el estado de ánimo:', error);
        res.status(500).send('Error al guardar el estado de ánimo');
    }
});
router.post('/guardar-tarea/:tableName', loginRequiredMiddleware, saveTareaController);
router.post('/completar-tarea/:tableName/:tareaId', loginRequiredMiddleware, completarTareaController);





export default router;

