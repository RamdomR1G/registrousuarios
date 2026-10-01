// DAO — equivalente a @Dao interface UsuarioDao en Room.
import { abrirBaseDeDatos, guardarBaseDeDatos } from './database'

function consultar(db, sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const filas = []
  while (stmt.step()) filas.push(stmt.getAsObject())
  stmt.free()
  return filas
}

export const usuarioDao = {
  // @Insert
  async insertar(u) {
    const db = await abrirBaseDeDatos()
    db.run('INSERT INTO usuarios (nombre, edad, profesion) VALUES (?, ?, ?)', [
      u.nombre, u.edad, u.profesion,
    ])
    await guardarBaseDeDatos()
  },

  // @Query("SELECT ...")
  async obtenerTodos() {
    const db = await abrirBaseDeDatos()
    return consultar(db, 'SELECT id, nombre, edad, profesion FROM usuarios ORDER BY id')
  },

  // @Update
  async actualizar(u) {
    const db = await abrirBaseDeDatos()
    db.run('UPDATE usuarios SET nombre = ?, edad = ?, profesion = ? WHERE id = ?', [
      u.nombre, u.edad, u.profesion, u.id,
    ])
    await guardarBaseDeDatos()
  },

  // @Delete
  async eliminar(id) {
    const db = await abrirBaseDeDatos()
    db.run('DELETE FROM usuarios WHERE id = ?', [id])
    await guardarBaseDeDatos()
  },
}