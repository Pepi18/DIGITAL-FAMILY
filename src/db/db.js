import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import {GENERIC_DB_BASE} from '../config.js'

// Función para obtener el nombre de la base de datos específica de una familia
function getFamilyDatabaseName(familyId) {
    return `family_${familyId}.db`; // Se asume que cada familia tiene su propio archivo de base de datos SQLite
}

// Función para conectar a la base de datos específica de una familia
export async function connectToFamilyDatabase(familyId, username, password) {
    const familyDbName = getFamilyDatabaseName(familyId);
    
    // Verificar las credenciales de usuario en la base de datos genérica
    const genericDb = await open({
        filename: GENERIC_DB_BASE,
        driver: sqlite3.Database
    });
    const user = await genericDb.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (!user) {
        throw new Error('Credenciales de usuario incorrectas');
    }
    
    // Conectar a la base de datos familiar si las credenciales son correctas
    const familyDb = await open({
        filename: familyDbName,
        driver: sqlite3.Database
    });

    return familyDb;
}

// Función para conectarse a la base de datos genérica
export async function connectGenericDatabase() {
    const db = await open({
        filename: GENERIC_DB_BASE,
        driver: sqlite3.Database
    });
    
    return db;
}

// Ejemplo de uso
const db = await connectGenericDatabase();
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
//Insertar los datos en la base de datos al realizar el registro
export const createsubmit = async (username, email, password) => {
    const database = 'userlogin'; 
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    try {
        await pool.query(`USE ${database}`);
        const [result] = await pool.query(query, [username, email, password]);
        console.log('Usuario Registrado correctamente:', result);
        return result;
    } catch (error) {
        console.error('Error en el registro:', error);
        throw error;
    }

}
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
