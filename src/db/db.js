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
                tarea TEXT,
                tareacompletada INTEGER,
                descripcionlogro TEXT,
                logroconseguido INTEGER,
                tituloevento TEXT,
                descripcionevento TEXT,
                fechainicioevento TEXT
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






