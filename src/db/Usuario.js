// ENTITY — equivalente a @Entity(tableName = "usuarios") en Room.
// Define la forma de un registro de la tabla "usuarios".

export function usuarioVacio() {
  return { id: null, nombre: '', edad: '', profesion: '' }
}

export function crearUsuario({ id = null, nombre, edad, profesion }) {
  return {
    id,
    nombre: String(nombre).trim(),
    edad: Number(edad),
    profesion: String(profesion).trim(),
  }
}