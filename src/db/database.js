// BASE DE DATOS — equivalente a @Database(entities = [Usuario], version = N) en Room.
import initSqlJs from 'sql.js/dist/sql-wasm-browser.js'
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url'
import { get, set } from 'idb-keyval'

const NOMBRE_BD = 'usuarios.db'

export const VERSION = 1

// Migraciones: cada una lleva la BD de la versión (n-1) a la versión n
const MIGRACIONES = {
  1: (db) =>
    db.run(`
      CREATE TABLE usuarios (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre    TEXT    NOT NULL,
        edad      INTEGER NOT NULL,
        profesion TEXT    NOT NULL
      )
    `),
}

let promesa = null
let db = null

async function iniciar() {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl })
  const guardada = await get(NOMBRE_BD) // archivo .db guardado en el dispositivo
  db = guardada ? new SQL.Database(guardada) : new SQL.Database()
  migrar()
  await guardarBaseDeDatos()
  return db
}

function migrar() {
  const actual = db.exec('PRAGMA user_version')[0].values[0][0]
  for (let v = actual + 1; v <= VERSION; v++) {
    MIGRACIONES[v](db)
    db.run(`PRAGMA user_version = ${v}`)
  }
}

export function abrirBaseDeDatos() {
  if (!promesa) promesa = iniciar()
  return promesa
}

// Persiste la BD completa en IndexedDB para que sobreviva al cerrar la app
export async function guardarBaseDeDatos() {
  await set(NOMBRE_BD, db.export())
}