import { connectDB } from '../db/db.js'; // Asegúrate de ajustar la ruta según la estructura de tu proyecto

export default (io) => {
    io.on('connection', async (socket) => {
        console.log('Nuevo cliente conectado');

        const tableName = socket.handshake.query.tableName;
        const username = socket.handshake.query.username;

        // Enviar mensajes anteriores al cliente al conectarse
        const db = await connectDB();
        const messages = await db.all(`SELECT * FROM ${tableName} WHERE contenidomensaje IS NOT NULL ORDER BY fechamensaje ASC`);
        socket.emit('previousMessages', messages);

        socket.on('chatMessage', async (msg) => {
            const fechamensaje = new Date().toISOString().slice(0, 16).replace('T', ' ');
            await db.run(`INSERT INTO ${tableName} (username, fechamensaje, contenidomensaje, mensajeleido) VALUES (?, ?, ?, ?)`, [username, fechamensaje, msg, 0]);
            io.emit('chatMessage', { username, fechamensaje, contenidomensaje: msg });
        });

        socket.on('disconnect', () => {
            console.log('Cliente desconectado');
        });
    });
};
