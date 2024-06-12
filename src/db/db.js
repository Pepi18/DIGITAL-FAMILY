import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import {GENERIC_DB_BASE} from '../config.js'


//conectar la BBDD
export async function connectDB() {
    try {
        const db = await open({
            filename: GENERIC_DB_BASE,
            driver: sqlite3.Database
        });
        console.log('Conexión a la base de datos establecida');
        return db;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }
}

export async function createFamilyTable(db, tableName) {
    try {
        
        // Crear la tabla si el nombre de la tabla no está en uso
        await db.exec(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                email TEXT,
                password TEXT,
                familyname TEXT,
                fechadiario TEXT,
                contenidodiario TEXT,
                fechaanimo TEXT,
                contenidoanimo TEXT,
                fechamensaje TEXT,
                contenidomensaje TEXT,
                mensajeleido INTEGER,
                fechafintarea TEXT,
                tarea TEXT,
                tareacompletada INTEGER,
                descripcionlogro TEXT,
                logroconseguido INTEGER,
                tituloevento TEXT,
                descripcionevento TEXT,
                fechainicioevento TEXT,
                puntos INTEGER DEFAULT 0,
                recompensa TEXT
            )
        `);
        console.log(`Tabla ${tableName} creada correctamente`);
    } catch (error) {
        console.error(`Error al crear la tabla ${tableName}:`, error);
        throw error;
    }
}


export async function insertDataIntoTable(db, tableName, data) {
    try {
        await db.run(`
            INSERT INTO ${tableName} (username, email, password, familyname)
            VALUES (?, ?, ?, ?)
        `, [data.username, data.email, data.password, data.familyname]);
        console.log('Datos insertados correctamente en la tabla', tableName);
    } catch (error) {
        console.error('Error al insertar datos en la tabla:', error);
        throw error;
    }
}

export async function getFamilyNameByTableName(tableName) {
    try {
        const db = await connectDB(); // Conectar a la base de datos

        // Consultar la base de datos para obtener el familyname asociado al tableName
        const query = 'SELECT familyname FROM ' + tableName + ' LIMIT 1'; // Limitamos a 1 para obtener solo un registro
        const result = await db.get(query);

        if (!result) {
            throw new Error(`No se encontró la familia asociada al tableName ${tableName}`);
        }

        return result.familyname;
    } catch (error) {
        console.error('Error al obtener el nombre de la familia por tableName:', error);
        throw error;
    }
}

export async function insertMemberIntoTable(tableName, username, password) {
    try {
        const db = await connectDB(); // Conectar a la base de datos

        // Insertar los datos en la tabla correspondiente
        await db.run(`
            INSERT INTO ${tableName} (username, password)
            VALUES (?, ?)
        `, [username, password]);

        console.log('Miembro insertado correctamente en la tabla', tableName);
    } catch (error) {
        console.error('Error al insertar miembro en la tabla:', error);
        throw error;
    }
}

//Verificar en la base de datos que las credenciales de inicio de sesión son las correctas
export const verifyCredentials = async (tableName, username, password) => {
    try {
        const db = await connectDB(); // Conectar a la base de datos

        // Verificar las credenciales en la tabla correspondiente a la familia
        const query = 'SELECT username, password FROM ' + tableName + ' WHERE username = ? AND password = ? LIMIT 1';
        const result = await db.get(query, [username, password]);

        // Si se encuentra un registro, las credenciales son válidas
        return !!result;
    } catch (error) {
        console.error('Error al verificar credenciales:', error);
        throw error;
    }
};

export async function insertDiarioEntry(tableName, username, fechadiario, contenido) {
    try {
        const db = await connectDB();

        await db.run(`
            INSERT INTO ${tableName} (username, fechadiario, contenidodiario)
            VALUES (?, ?, ?)
        `, [username, fechadiario, contenido]);

        console.log('Entrada del diario insertada correctamente');
    } catch (error) {
        console.error('Error al insertar la entrada del diario:', error);
        throw error;
    }
}

export async function getDiarioEntries(tableName, username) {
    try {
        const db = await connectDB();

        const result = await db.all(`
            SELECT * FROM ${tableName} WHERE username = ? AND contenidodiario IS NOT NULL ORDER BY fechadiario DESC
        `, [username]);

        return result;
    } catch (error) {
        console.error('Error al obtener las entradas del diario:', error);
        throw error;
    }
}

export async function getCalendarEvents(tableName, year) {
    try {
        const db = await connectDB();
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const query = `
            SELECT * FROM ${tableName} 
            WHERE fechainicioevento BETWEEN ? AND ?
        `;

        const events = await db.all(query, [startDate, endDate]);
        return events;
    } catch (error) {
        console.error('Error al obtener los eventos del calendario:', error);
        throw error;
    }
}

export async function insertCalendarEvent(tableName, username, date, title, description) {
    try {
        const db = await connectDB();
        await db.run(`
            INSERT INTO ${tableName} (username, fechainicioevento, tituloevento, descripcionevento)
            VALUES (?, ?, ?, ?)
        `, [username, date, title, description]);

        console.log('Evento insertado correctamente en la tabla', tableName);
    } catch (error) {
        console.error('Error al insertar el evento en la tabla:', error);
        throw error;
    }
}

export async function getEventsForYear(tableName, year) {
    const db = await connectDB();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const events = await db.all(
        `SELECT tituloevento, descripcionevento, fechainicioevento FROM ${tableName} 
        WHERE fechainicioevento BETWEEN ? AND ?`,
        [startDate, endDate]
    );
    return events;
}

export async function addEventToCalendar(tableName, date, title, description) {
    const db = await connectDB();
    await db.run(
        `INSERT INTO ${tableName} (tituloevento, descripcionevento, fechainicioevento) 
        VALUES (?, ?, ?)`,
        [title, description, date]
    );
}


export const saveAnimo = async (tableName, username, contenidoanimo, fechaanimo) => {
    const db = await connectDB();
    const query = `
        INSERT INTO ${tableName} (username, contenidoanimo, fechaanimo)
        VALUES (?, ?, ?)
    `;
    const values = [username, contenidoanimo, fechaanimo];

    await db.run(query, values);
};



export const getRecentAnimos = async (tableName) => {
    try {
        const db = await connectDB();
        const query = `
            SELECT username, contenidoanimo, MAX(fechaanimo) AS ultima_fecha
            FROM ${tableName}
            WHERE contenidoanimo IS NOT NULL
            GROUP BY username
            ORDER BY ultima_fecha DESC
        `;
        const result = await db.all(query);
        return result;
    } catch (error) {
        console.error('Error al obtener los estados de ánimo recientes:', error);
        throw error;
    }
};


// Función para guardar una nueva tarea
export const saveTarea = async (tableName, username, tarea, fechafintarea) => {
    const db = await connectDB();
    const query = `
        INSERT INTO ${tableName} (username, tarea, fechafintarea, tareacompletada, logroconseguido, descripcionlogro)
        VALUES (?, ?, ?, 0, 0, NULL)
    `;
    const values = [username, tarea, fechafintarea];

    await db.run(query, values);
};

// Función para obtener todas las tareas
export const getTareas = async (tableName) => {
    const db = await connectDB();
    const query = `
        SELECT id, username, tarea, fechafintarea, tareacompletada
        FROM ${tableName}
        WHERE tarea IS NOT NULL AND tarea != ''
        ORDER BY fechafintarea ASC
    `;
    const result = await db.all(query);
    return result;
};


// Función para marcar una tarea como completada
export const completarTarea = async (tableName, tareaId) => {
    const db = await connectDB();
    const query = `
        UPDATE ${tableName}
        SET tareacompletada = 1,
            descripcionlogro = 'Logro conseguido: ' || tarea,
            logroconseguido = '+1 punto'
        WHERE id = ?
    `;
    await db.run(query, [tareaId]);
};

// Función para actualizar las tareas no completadas
export const actualizarTareasNoCompletadas = async (tableName) => {
    const db = await connectDB();
    const query = `
        UPDATE ${tableName}
        SET tareacompletada = 'Logro NO conseguido: ' || tarea,
            descripcionlogro = 'Logro NO conseguido: ' || tarea
        WHERE fechafintarea < date('now') AND tareacompletada = 0
    `;
    await db.run(query);
};

// Función para obtener logros
export const getLogros = async (tableName) => {
    const db = await connectDB();
    const query = `
        SELECT username, puntos
        FROM (
            SELECT username, 
                   SUM(CASE WHEN logroconseguido > 0 THEN logroconseguido ELSE 0 END) - 
                   SUM(CASE WHEN logroconseguido < 0 THEN -logroconseguido ELSE 0 END) AS puntos
            FROM ${tableName}
            GROUP BY username
        ) AS subquery
        WHERE username IS NOT NULL
        ORDER BY puntos DESC
    `;
    const result = await db.all(query);
    return result;
};


export const eliminarTarea = async (tableName, tareaId) => {
    const db = await connectDB();
    const query = `
        UPDATE ${tableName}
        SET tarea = NULL
        WHERE id = ?
    `;
    await db.run(query, [tareaId]);
};

export const getTopMember = async (tableName) => {
    const db = await connectDB();
    const query = `
        SELECT username, SUM(logroconseguido) AS puntos
        FROM ${tableName}
        GROUP BY username
        HAVING SUM(logroconseguido) = (
            SELECT MAX(puntos)
            FROM (
                SELECT SUM(logroconseguido) AS puntos
                FROM ${tableName}
                GROUP BY username
            )
        )
    `;
    const result = await db.all(query);
    return result;
};




export const agregarRecompensa = async (tableName, puntos, recompensa) => {
    const db = await connectDB();
    const query = `
        INSERT INTO ${tableName} (puntos, recompensa)
        VALUES (?, ?)
    `;
    await db.run(query, [puntos, recompensa]);
};

// Función para canjear una recompensa
export const canjearRecompensa = async (tableName, username, puntos, recompensa) => {
    const db = await connectDB();

    // Registrar la recompensa canjeada
    const insertQuery = `
        INSERT INTO ${tableName} (username, logroconseguido, recompensa)
        VALUES (?, ?, ?)
    `;
    await db.run(insertQuery, [username, -puntos, recompensa]);
};

// Función para obtener los puntos disponibles de un usuario
export const getPuntosDisponibles = async (tableName, username) => {
    const db = await connectDB();
    const query = `
        SELECT SUM(logroconseguido) AS puntos
        FROM ${tableName}
        WHERE username = ?
    `;
    const result = await db.get(query, [username]);
    if (result) {
        return result.puntos;
    } else {
        return 0; // Si el usuario no tiene puntos, devolvemos 0
    }
};


// Función para obtener logros con recompensas
export const getLogrosConRecompensas = async (tableName) => {
    const db = await connectDB();
    const query = `
        SELECT username, logroconseguido, recompensa
        FROM ${tableName}
    `;
    const logros = await db.all(query);
    return logros;
};


export const obtenerRecompensas = async (tableName) => {
    const db = await connectDB();
    const query = `
        SELECT recompensa, puntos
        FROM ${tableName}
         WHERE puntos > 0
    `;
    const recompensas = await db.all(query);
    return recompensas;
};
