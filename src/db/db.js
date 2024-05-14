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
                mensajeleido INTEGER,
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





































//Guardar post en la base de datos
export const createpost = async (titulo, texto) => {
    const database = 'userlogin'; 
    const query = 'INSERT INTO posts (titulo, texto) VALUES (?, ?)';
    try {
        await pool.query(`USE ${database}`);
        const [result] = await pool.query(query, [titulo, texto]);
        console.log('Post guardado correctamente:', result);
        return result;
    } catch (error) {
        console.error('Error al guardar el post:', error);
        throw error;
    }
};

//Verificar en la base de datos que las credenciales de inicio de sesión son las correctas
export const verifyCredentials = async (username, password) => {
    console.log('Valor de username:', username);
    console.log('Valor de password:', password);
    const database = 'userlogin';
    const query = 'SELECT username, password FROM users WHERE username = ? LIMIT 1';
    console.log("Valor de username:", username);
    try {
        await pool.query(`USE ${database}`);
        console.log('Conexión exitosa a la base de datos.');

        const [userRows, _] = await pool.query(query, [username]);
        console.log('Consulta ejecutada correctamente:', userRows);

        if (userRows.length === 0) {
            console.log('No se encontró ningún usuario con el nombre de usuario proporcionado.');
            return false;
        }

        const user = userRows[0];
        if (user.password === password) {
            console.log('Contraseña coincidente.');
            return true;
        } else {
            console.log('Contraseña incorrecta.');
            return false;
        }
    } catch (error) {
        console.error('Error al verificar credenciales:', error);
        throw error;
    }
};
//Buscar post en la base de datos pos título
export const searchPostsInDatabase = async (titulo) => {
    const database = 'userlogin';
    const query = 'SELECT * FROM posts WHERE titulo LIKE ?'; // Consulta para buscar publicaciones por título
    
    try {
        // Ejecutar la consulta SQL con el título proporcionado
        await pool.query(`USE ${database}`);
        const [datos, _] = await pool.query(query, [`%${titulo}%`]);
        console.log('Posts encontrados:', datos);
        return datos; // Devolver los resultados de la búsqueda
    } catch (error) {
        console.error('Error al buscar publicaciones por título en la base de datos:', error);
        throw error;
    }
};
//Borrar registro de la base de datos
export const deleteRecord= async (id) => {
    const database = 'userlogin';
    const query = 'DELETE FROM posts WHERE id = ?'; // Consulta para eliminar un registro por su ID
    
    try {
        // Ejecutar la consulta SQL con el ID proporcionado
        await pool.query(`USE ${database}`);
        const [result, _] = await pool.query(query, [id]);
        console.log('Registro eliminado correctamente');
        return result; // Devolver el resultado de la operación de eliminación
    } catch (error) {
        console.error('Error al eliminar el registro:', error);
        throw error;
    }
};
